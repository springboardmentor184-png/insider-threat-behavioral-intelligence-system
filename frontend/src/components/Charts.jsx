import React, { useState } from 'react'

/**
 * Interactive SVG Pie / Donut Chart Component
 * Renders slices with colors, hover tooltips, center label, and interactive legend
 */
export const PieChartComponent = ({ data = [], title = "Distribution" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No data available for {title}
      </div>
    )
  }

  let cumulativeAngle = 0
  const slices = data.map((item, index) => {
    const value = item.value || 0
    const percentage = ((value / total) * 100).toFixed(1)
    const angle = (value / total) * 360

    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    cumulativeAngle += angle

    // SVG Arc Path math
    const radius = 80
    const innerRadius = 45
    const centerX = 100
    const centerY = 100

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)

    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const ix1 = centerX + innerRadius * Math.cos(endRad)
    const iy1 = centerY + innerRadius * Math.sin(endRad)
    const ix2 = centerX + innerRadius * Math.cos(startRad)
    const iy2 = centerY + innerRadius * Math.sin(startRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
      'Z'
    ].join(' ')

    return {
      ...item,
      percentage,
      pathData,
      index
    }
  })

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {slices.map((slice) => (
            <path
              key={slice.label}
              d={slice.pathData}
              fill={slice.color}
              opacity={hoveredIndex === null || hoveredIndex === slice.index ? 1 : 0.45}
              style={{
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                transform: hoveredIndex === slice.index ? 'scale(1.04)' : 'scale(1)',
                transformOrigin: '100px 100px'
              }}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center Donut Label */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {activeSlice ? activeSlice.value : total}
          </span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            {activeSlice ? activeSlice.label : 'Total'}
          </div>
        </div>
      </div>

      {/* Legend Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', width: '100%' }}>
        {slices.map((slice) => (
          <div 
            key={slice.label}
            onMouseEnter={() => setHoveredIndex(slice.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: hoveredIndex === slice.index ? 'var(--bg-tertiary)' : 'transparent',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: slice.color, display: 'inline-block' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{slice.label}</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              {slice.value} ({slice.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Dynamic Interactive Bar Chart Component
 */
export const BarChartComponent = ({ data = [], height = 180 }) => {
  const [hoveredBar, setHoveredBar] = useState(null)

  const maxValue = Math.max(...data.map(d => d.value || 0), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: `${height}px`, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {data.map((item, index) => {
          const heightPercent = Math.max(8, ((item.value || 0) / maxValue) * 100)
          const isHovered = hoveredBar === index

          return (
            <div 
              key={item.label}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  top: '-32px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}>
                  {item.label}: {item.value}
                </div>
              )}

              {/* Bar column */}
              <div 
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${heightPercent}%`,
                  backgroundColor: item.color || 'var(--accent-blue)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isHovered ? 1 : 0.85,
                  boxShadow: isHovered ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Bar Labels */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {data.map((item, index) => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
