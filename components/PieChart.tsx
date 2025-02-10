type PieChartProps = {
    data: number[];
    labels: string[];
    colors?: string[];
    size?: number; // 차트 크기 (기본값: 200px)
  };
  
  const PieChart: React.FC<PieChartProps> = ({ data, labels, colors, size = 200 }) => {
    const total = data.reduce((sum, value) => sum + value, 0);
    const defaultColors = ["#4ADE80", "#F87171", "#FBBF24", "#60A5FA", "#A78BFA"];
    const chartColors = colors || defaultColors;
  
    let cumulativePercentage = 0;
  
    // 원형 차트를 그리기 위한 Path 생성
    const slices = data.map((value, index) => {
      const percentage = (value / total) * 100;
      const startAngle = cumulativePercentage * 3.6; // 각도 (360도 기준)
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      cumulativePercentage += percentage;
  
      const largeArcFlag = percentage > 50 ? 1 : 0;
      const startX = 50 + 50 * Math.cos((Math.PI / 180) * startAngle);
      const startY = 50 + 50 * Math.sin((Math.PI / 180) * startAngle);
      const endX = 50 + 50 * Math.cos((Math.PI / 180) * endAngle);
      const endY = 50 + 50 * Math.sin((Math.PI / 180) * endAngle);
  
      return {
        d: `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`,
        fill: chartColors[index % chartColors.length],
      };
    });
  
    return (
      <div className="flex items-center gap-4">
        {/* 원형 차트 */}
        <div style={{ width: size, height: size }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {slices.map((slice, index) => (
              <path key={index} d={slice.d} fill={slice.fill} />
            ))}
                      {/* 가운데 도넛 공간 */}
          <circle cx="50" cy="50" r="20" fill="white" />
          </svg>
        </div>
        
        {/* 인덱스 */}
        <ul className="text-sm space-y-2">
          {labels.map((label, index) => (
            <li key={index} className="flex items-center">
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  backgroundColor: chartColors[index % chartColors.length],
                  marginRight: 8,
                }}
              />
              {label} ({data[index]})
            </li>
          ))}
        </ul>
      </div>
    );
 
  };
  
  export default PieChart;
  