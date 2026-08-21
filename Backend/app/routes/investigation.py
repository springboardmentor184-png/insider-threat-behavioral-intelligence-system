from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    InvestigationResponse,
    InvestigationDashboardResponse,
    InvestigationDetailsResponse,
    InvestigationTimelineResponse,
    InvestigationEvidenceResponse,
    DeviceAnalysisResponse,
    RiskHistoryResponse,
    EventCorrelationResponse,
    InvestigationWorkflowUpdate,
    InvestigationWorkflowResponse
)

from app.services.investigation_service import (
    get_dashboard_investigations,
    get_active_investigations,
    get_investigation_details,
    get_activity_timeline,
    get_threat_evidence,
    get_device_analysis,
    get_user_risk_history,
    get_event_correlation,
    update_investigation_workflow,
    update_status
)
from app.utils.investigation_report_generator import (
    generate_investigation_report
)

router = APIRouter(
    prefix="/investigations",
    tags=["Threat Investigation"]
)


# =====================================================
# Investigation Dashboard
# =====================================================

@router.get(
    "/dashboard",
    response_model=list[InvestigationDashboardResponse]
)
def dashboard(
    db: Session = Depends(get_db)
):

    return get_dashboard_investigations(db)


# =====================================================
# Investigation Queue
# =====================================================

@router.get(
    "/",
    response_model=list[InvestigationResponse]
)
def investigation_queue(
    db: Session = Depends(get_db)
):

    return get_active_investigations(db)


# =====================================================
# Investigation Details
# =====================================================

@router.get(
    "/{investigation_id}/details",
    response_model=InvestigationDetailsResponse
)
def details(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    investigation = get_investigation_details(
        db,
        investigation_id
    )

    if not investigation:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found"
        )

    return investigation


# =====================================================
# Investigation Workflow
# =====================================================

@router.put(
    "/{investigation_id}/status",
    response_model=InvestigationResponse
)
def change_status(
    investigation_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    investigation = update_status(
        db,
        investigation_id,
        status
    )

    if not investigation:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found"
        )

    return investigation

# =====================================================
# Activity Timeline
# =====================================================

@router.get(
    "/{investigation_id}/timeline",
    response_model=InvestigationTimelineResponse
)
def timeline(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    timeline = get_activity_timeline(
        db,
        investigation_id
    )

    if not timeline:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found"
        )

    return timeline

# =====================================================
# Threat Evidence Collection
# =====================================================

@router.get(
    "/{investigation_id}/evidence",
    response_model=InvestigationEvidenceResponse
)
def evidence(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    result = get_threat_evidence(
        db,
        investigation_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Evidence not found"
        )

    return result

# =====================================================
# Device Analysis
# =====================================================

@router.get(
    "/{investigation_id}/device-analysis",
    response_model=DeviceAnalysisResponse
)
def device_analysis(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    result = get_device_analysis(
        db,
        investigation_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Device analysis not found"
        )

    return result

# =====================================================
# User Risk History
# =====================================================

@router.get(
    "/{investigation_id}/risk-history",
    response_model=RiskHistoryResponse
)
def risk_history(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    result = get_user_risk_history(
        db,
        investigation_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Risk history not found"
        )

    return result

# =====================================================
# Event Correlation
# =====================================================

@router.get(
    "/{investigation_id}/correlation",
    response_model=EventCorrelationResponse
)
def correlation(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    result = get_event_correlation(
        db,
        investigation_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Correlation not found"
        )

    return result

# =====================================================
# Investigation Workflow
# =====================================================

@router.put(
    "/{investigation_id}/workflow",
    response_model=InvestigationWorkflowResponse
)
def workflow(
    investigation_id: int,
    workflow: InvestigationWorkflowUpdate,
    db: Session = Depends(get_db)
):

    result = update_investigation_workflow(
        db,
        investigation_id,
        workflow
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found"
        )

    return result

# =====================================================
# Investigation PDF Report
# =====================================================

@router.get(
    "/{investigation_id}/report"
)
def download_investigation_report(
    investigation_id: int,
    db: Session = Depends(get_db)
):

    # ---------------------------------
    # Investigation Details
    # ---------------------------------

    investigation = get_investigation_details(
        db,
        investigation_id
    )

    if not investigation:

        raise HTTPException(
            status_code=404,
            detail="Investigation not found"
        )

    # ---------------------------------
    # Timeline
    # ---------------------------------

    timeline = get_activity_timeline(
        db,
        investigation_id
    )

    # ---------------------------------
    # Evidence
    # ---------------------------------

    evidence = get_threat_evidence(
        db,
        investigation_id
    )

    # ---------------------------------
    # Device Analysis
    # ---------------------------------

    device_analysis = get_device_analysis(
        db,
        investigation_id
    )

    # ---------------------------------
    # Risk History
    # ---------------------------------

    risk_history = get_user_risk_history(
        db,
        investigation_id
    )

    # ---------------------------------
    # Event Correlation
    # ---------------------------------

    correlation = get_event_correlation(
        db,
        investigation_id
    )

    # ---------------------------------
    # Validate Required Data
    # ---------------------------------

    if not evidence:
        raise HTTPException(
            status_code=404,
            detail="Investigation evidence not found"
        )

    if not device_analysis:
        raise HTTPException(
            status_code=404,
            detail="Device analysis not found"
        )

    if not risk_history:
        raise HTTPException(
            status_code=404,
            detail="Risk history not found"
        )

    if not correlation:
        raise HTTPException(
            status_code=404,
            detail="Event correlation not found"
        )

    # ---------------------------------
    # Generate PDF
    # ---------------------------------

    pdf_path = generate_investigation_report(
        investigation=investigation,
        timeline=timeline,
        evidence=evidence,
        device_analysis=device_analysis,
        risk_history=risk_history,
        correlation=correlation
    )

    # ---------------------------------
    # Return PDF
    # ---------------------------------

    return FileResponse(
        path=pdf_path,
        filename=(
            f"{investigation['employee_code']}"
            f"_Investigation_Report.pdf"
        ),
        media_type="application/pdf"
    )