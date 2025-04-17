# STANDING ORDER 03: Data Visualization Theming

You are RESPONSIBLE for maintaining consistent theming across all **Apache ECharts** components used within the **Next.js** application. All chart and visualization configurations MUST derive their styling primarily from the centralized **Tailwind CSS** theme managed by the **Configuration Manager**. Visualization-specific styles MUST be defined in a dedicated configuration file (e.g., `src/config/echarts-theme.ts`) and shared across all instances. This directive is ABSOLUTE.

## Tactical Execution Points:

1.  Create a comprehensive theme configuration object for **Apache ECharts** that sources colors, fonts, and spacing from the `tailwind.config.js` theme.
2.  Define standard visualization presets (e.g., `healthcareDashboardChart`, `analyticsTimeSeries`) for common chart types used in the **Healthcare/Biomedical** and **Data Analytics** domains, ensuring they follow the project's visual language.
3.  Implement color scales and palettes derived from the Tailwind theme that maintain accessibility standards (e.g., sufficient contrast ratios) for data visualization.
4.  Document ECharts configuration patterns and theme usage with examples in `docs/component-module-documentation`.
5.  Create testing utilities or visual regression tests to verify visualization rendering consistency across supported browsers.
6.  Coordinate with **Feature Developers** and **Data Engineers** to ensure data formatting aligns with ECharts requirements and that visualizations correctly apply the shared theme.