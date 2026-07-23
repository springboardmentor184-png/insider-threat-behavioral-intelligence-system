"""
Utility functions for behavioral analysis and risk calculations.

This module provides reusable functions for:
- Time-based behavioral classifications
- Activity aggregations
- Behavioral pattern detection
- Data normalization
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from collections import Counter, defaultdict
from statistics import mean, stdev
import math


class TimeBasedClassification:
    """Utilities for time-based behavioral classification"""

    # Business hours: 9 AM to 5 PM
    BUSINESS_HOURS_START = 9
    BUSINESS_HOURS_END = 17

    @staticmethod
    def is_after_hours(timestamp: datetime) -> bool:
        """Check if activity occurred after business hours"""
        hour = timestamp.hour
        return hour < TimeBasedClassification.BUSINESS_HOURS_START or hour >= TimeBasedClassification.BUSINESS_HOURS_END

    @staticmethod
    def is_weekend(timestamp: datetime) -> bool:
        """Check if activity occurred on weekend (Saturday=5, Sunday=6)"""
        return timestamp.weekday() >= 5

    @staticmethod
    def is_night_activity(timestamp: datetime) -> bool:
        """Check if activity occurred during night hours (10 PM - 6 AM)"""
        hour = timestamp.hour
        return hour >= 22 or hour < 6

    @staticmethod
    def get_time_of_day_category(hour: int) -> str:
        """Classify hour into time of day category"""
        if 0 <= hour < 6:
            return "night"
        elif 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "late_night"


class BehavioralMetrics:
    """Calculate behavioral metrics from activity data"""

    @staticmethod
    def calculate_average_hour(timestamps: List[datetime]) -> Optional[float]:
        """Calculate average hour of day (decimal format: 9.5 = 9:30 AM)"""
        if not timestamps:
            return None
        
        hours = []
        for ts in timestamps:
            decimal_hour = ts.hour + ts.minute / 60 + ts.second / 3600
            hours.append(decimal_hour)
        
        return round(mean(hours), 2)

    @staticmethod
    def calculate_hourly_distribution(timestamps: List[datetime]) -> Dict[int, int]:
        """Get distribution of activities by hour"""
        distribution = defaultdict(int)
        for ts in timestamps:
            distribution[ts.hour] += 1
        return dict(sorted(distribution.items()))

    @staticmethod
    def calculate_daily_distribution(timestamps: List[datetime]) -> Dict[str, int]:
        """Get distribution of activities by day of week"""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        distribution = defaultdict(int)
        for ts in timestamps:
            day_name = days[ts.weekday()]
            distribution[day_name] += 1
        return dict(distribution)

    @staticmethod
    def calculate_weekly_pattern(timestamps: List[datetime], days_back: int = 7) -> Dict[str, any]:
        """Calculate weekly activity pattern"""
        if not timestamps:
            return {}
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        recent_activities = [ts for ts in timestamps if ts >= cutoff_date]
        
        if not recent_activities:
            return {}
        
        daily_counts = defaultdict(int)
        for ts in recent_activities:
            date = ts.date()
            daily_counts[date] += 1
        
        if not daily_counts:
            return {}
        
        total = sum(daily_counts.values())
        avg_per_day = round(total / len(daily_counts), 2)
        
        return {
            "total_activities": total,
            "active_days": len(daily_counts),
            "avg_per_day": avg_per_day,
            "max_day": max(daily_counts.values()),
            "min_day": min(daily_counts.values())
        }

    @staticmethod
    def get_most_common(items: List[str], top_n: int = 5) -> List[Tuple[str, int]]:
        """Get most common items"""
        if not items:
            return []
        counter = Counter(items)
        return counter.most_common(top_n)

    @staticmethod
    def calculate_activity_spike(
        recent_count: int,
        historical_avg: float,
        threshold_multiplier: float = 2.0
    ) -> Optional[float]:
        """
        Calculate activity spike percentage.
        Returns None if no historical average.
        """
        if not historical_avg or historical_avg == 0:
            return None
        
        spike_percentage = ((recent_count - historical_avg) / historical_avg) * 100
        return round(spike_percentage, 2)

    @staticmethod
    def calculate_consistency_score(values: List[float]) -> float:
        """
        Calculate consistency score (0-100).
        Low variance = high consistency.
        """
        if len(values) < 2:
            return 100.0
        
        try:
            std_dev = stdev(values)
            avg = mean(values)
            
            if avg == 0:
                return 100.0
            
            coefficient_of_variation = (std_dev / avg) * 100
            consistency = max(0, 100 - coefficient_of_variation)
            return round(min(consistency, 100.0), 2)
        except (ValueError, ZeroDivisionError):
            return 100.0


class DataAggregation:
    """Aggregate and summarize activity data"""

    @staticmethod
    def count_activity_type(activities: List, activity_type_name: str) -> int:
        """Count occurrences of specific activity type"""
        return sum(1 for a in activities if hasattr(a, 'activity_type') and a.activity_type.value == activity_type_name)

    @staticmethod
    def sum_data_transferred(activities: List) -> int:
        """Sum total data transferred (uploads + downloads)"""
        total = 0
        for activity in activities:
            if hasattr(activity, 'upload_size') and activity.upload_size:
                total += activity.upload_size
            if hasattr(activity, 'download_size') and activity.download_size:
                total += activity.download_size
        return total

    @staticmethod
    def calculate_session_stats(session_durations: List[int]) -> Dict[str, float]:
        """Calculate statistics from session durations (in seconds)"""
        if not session_durations:
            return {}
        
        durations_in_minutes = [d / 60 for d in session_durations if d > 0]
        
        if not durations_in_minutes:
            return {}
        
        return {
            "avg_session_duration_minutes": round(mean(durations_in_minutes), 2),
            "max_session_minutes": round(max(durations_in_minutes), 2),
            "min_session_minutes": round(min(durations_in_minutes), 2),
            "total_sessions": len(durations_in_minutes)
        }


class RiskFactorDetection:
    """Detect risk factors from activity patterns"""

    @staticmethod
    def detect_impossible_travel(
        locations: List[str],
        timestamps: List[datetime],
        location_change_threshold_minutes: int = 60
    ) -> List[Dict]:
        """
        Detect impossible travel (location change too fast).
        Returns list of suspicious location transitions.
        """
        if len(locations) < 2 or len(timestamps) != len(locations):
            return []
        
        suspicious_transitions = []
        
        for i in range(1, len(locations)):
            if locations[i] != locations[i - 1] and locations[i] and locations[i - 1]:
                time_diff = (timestamps[i] - timestamps[i - 1]).total_seconds() / 60
                
                if time_diff < location_change_threshold_minutes:
                    suspicious_transitions.append({
                        "from": locations[i - 1],
                        "to": locations[i],
                        "time_diff_minutes": round(time_diff, 2),
                        "timestamp": timestamps[i]
                    })
        
        return suspicious_transitions

    @staticmethod
    def detect_unusual_hours_activity(
        timestamps: List[datetime],
        after_hours_threshold: float = 0.1
    ) -> Dict[str, any]:
        """
        Detect unusual after-hours activity.
        Returns statistics about after-hours activities.
        """
        if not timestamps:
            return {}
        
        after_hours_count = sum(
            1 for ts in timestamps 
            if TimeBasedClassification.is_after_hours(ts)
        )
        
        after_hours_percentage = (after_hours_count / len(timestamps)) * 100
        is_risky = after_hours_percentage > (after_hours_threshold * 100)
        
        return {
            "after_hours_count": after_hours_count,
            "after_hours_percentage": round(after_hours_percentage, 2),
            "is_suspicious": is_risky
        }

    @staticmethod
    def detect_device_anomalies(
        devices: List[str],
        known_device_threshold: int = 2
    ) -> Dict[str, any]:
        """Detect use of unknown devices"""
        if not devices:
            return {}
        
        device_counts = Counter([d for d in devices if d])
        total_activities = len([d for d in devices if d])
        
        return {
            "unique_devices": len(device_counts),
            "primary_device": device_counts.most_common(1)[0][0] if device_counts else None,
            "device_distribution": dict(device_counts.most_common(5)),
            "is_multi_device": len(device_counts) > known_device_threshold,
            "total_device_activities": total_activities
        }

    @staticmethod
    def normalize_score(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
        """Normalize value to 0-100 range"""
        if max_val == min_val:
            return 50.0
        normalized = ((value - min_val) / (max_val - min_val)) * 100
        return round(max(0, min(100, normalized)), 2)
