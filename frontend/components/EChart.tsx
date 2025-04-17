import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
}

const EChart: React.FC<EChartProps> = ({ option, style }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(option);
    }
    return () => {
      chartInstance.current?.dispose();
    };
  }, [option]);

  return <div ref={chartRef} style={style || { width: '100%', height: 400 }} />;
};

export default EChart;
