// services/pythonAnalyzer.ts
import type { RetentionAnalysis, ProblemPoint, StrengthPoint, HookAnalysis, RepeatedSegment } from '../types.ts';
import { logger } from './loggingService.ts';

export interface PythonAnalysisResult extends RetentionAnalysis {
    volatilityScore: number;
    retentionCurve: { time: number; value: number }[];
    rawDataPoints: { time: number; value: number }[];
    hookAnalysis: HookAnalysis;
    repeatedSegments: RepeatedSegment[];
    repeatedSegmentsCurve?: { time: number; value: number }[];
}

export const analyzeRetentionDataWithPython = async (
    pyodide: any,
    statsText: string,
    absoluteVideoDuration?: number,
    dipSensitivity: number = 12,
    peakSensitivityFactor: number = 1.5,
): Promise<PythonAnalysisResult> => {
    if (!pyodide) {
        throw new Error("Pyodide is not initialized.");
    }
    
    logger.info("Запуск анализа данных об удержании через Pyodide...", {
        dipSensitivity, peakSensitivityFactor
    });
    // This Python script performs a detailed analysis of video retention data.
    const pythonCode = `
import pandas as pd
import numpy as np
import io
import json

def analyze_retention(csv_text, absolute_duration=None, dip_sensitivity=12.0, peak_sensitivity_factor=1.5):
    try:
        lines = csv_text.strip().splitlines()
        header_row_idx = -1
        # Find header row, which is more reliable than assuming it's the first
        for i, line in enumerate(lines):
            lower_line = line.lower()
            if 'elapsed video time' in lower_line and 'retention' in lower_line:
                header_row_idx = i
                break
        
        # If no header found, assume simple columns. Otherwise, parse from header.
        if header_row_idx == -1:
            df = pd.read_csv(io.StringIO(csv_text), header=None, on_bad_lines='skip', sep='[,;]', engine='python')
        else:
            csv_data = "\\n".join(lines[header_row_idx:])
            df = pd.read_csv(io.StringIO(csv_data), on_bad_lines='skip', sep=None, engine='python')

        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # Identify columns by content keywords
        time_col = next((c for c in df.columns if 'time' in c), df.columns[0])
        retention_col = next((c for c in df.columns if 'retention' in c), df.columns[1])
        # Look for the "repeated segments" column
        rewatch_col_name = next((c for c in df.columns if 'repeated' in c or 'rewatch' in c), None)

        # Build a clean DataFrame
        clean_cols = {time_col: 'time', retention_col: 'value'}
        if rewatch_col_name:
            clean_cols[rewatch_col_name] = 'rewatch'
        
        df = df[list(clean_cols.keys())].copy()
        df.rename(columns=clean_cols, inplace=True)
        
        # Data cleaning
        for col in df.columns:
             if df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.replace('%', '', regex=False)
        
        df = df.apply(pd.to_numeric, errors='coerce').dropna()
        df = df.sort_values(by='time').reset_index(drop=True)
        
        if absolute_duration and absolute_duration > 0:
            df = df[df['time'] <= absolute_duration]

        if len(df) < 2:
            return json.dumps({
                "averageRetention": 0, "totalDuration": absolute_duration or 0, "volatilityScore": 0,
                "problemPoints": [], "strengthPoints": [], "repeatedSegments": [],
                "retentionCurve": [], "rawDataPoints": [],
                "repeatedSegmentsCurve": [],
                "hookAnalysis": {"verdict": "bad", "initialDrop": 100}
            })
            
        total_duration = absolute_duration if absolute_duration and absolute_duration > 0 else df['time'].iloc[-1]
            
        if not df.empty and total_duration > df['time'].iloc[-1]:
            last_row = df.iloc[-1:].copy()
            last_row['time'] = total_duration
            df = pd.concat([df, last_row], ignore_index=True)

        # Standard analysis
        area_under_curve = np.trapz(df['value'], df['time'])
        average_retention = area_under_curve / total_duration if total_duration > 0 else 0
        volatility_score = df['value'].diff().abs().mean()
        
        hook_df = df[df['time'] <= 30]
        initial_drop = (df['value'].iloc[0] - hook_df['value'].iloc[-1]) if not hook_df.empty else 0
        verdict = 'bad' if initial_drop > 15 else 'average' if initial_drop > 7 else 'good'
        hook_analysis = {"verdict": verdict, "initialDrop": initial_drop}

        # Problem points
        problem_points = []
        high_water_mark = df['value'].iloc[0]
        for _, row in df.iterrows():
            drop = high_water_mark - row['value']
            if drop >= dip_sensitivity:
                problem_points.append({"timestamp": row['time'], "retentionDip": drop})
                high_water_mark = row['value']
            elif row['value'] > high_water_mark:
                high_water_mark = row['value']
        problem_points = sorted(problem_points, key=lambda x: x['retentionDip'], reverse=True)[:7]

        # Strength points (peaks and plateaus)
        df['delta'] = df['value'].diff().fillna(0)
        mean_delta, std_delta = df['delta'].mean(), df['delta'].std()
        rise_threshold = mean_delta + (std_delta * peak_sensitivity_factor)
        peaks = df[df['delta'] > rise_threshold].copy()
        peaks['type'] = 'peak'
        strength_points = peaks.rename(columns={'time': 'timestamp', 'delta': 'retentionPeak'})[['timestamp', 'retentionPeak', 'type']].to_dict('records')
        strength_points = sorted(strength_points, key=lambda x: x['retentionPeak'], reverse=True)[:5]
        
        # Repeated Segments Analysis
        repeated_segments = []
        repeated_segments_curve = []
        if 'rewatch' in df.columns and not df['rewatch'].isnull().all():
            # Normalize rewatch data to be on the same scale as retention for visualization
            rewatch_normalized = (df['rewatch'] - df['rewatch'].min()) / (df['rewatch'].max() - df['rewatch'].min()) * 25 # Scale to 0-25 range
            df['rewatch_viz'] = df['value'] + rewatch_normalized # Add to main curve for visual bump
            
            # Find peaks in the original rewatch data
            rewatch_mean = df['rewatch'].mean()
            rewatch_std = df['rewatch'].std()
            rewatch_threshold = rewatch_mean + (rewatch_std * 1.0) # Lower threshold for rewatches
            
            rewatch_peaks = df[df['rewatch'] > rewatch_threshold]
            
            # Group consecutive peaks into segments
            rewatch_peaks = rewatch_peaks.copy()
            rewatch_peaks['segment'] = (rewatch_peaks.index.to_series().diff() > 3).cumsum()
            for _, segment_df in rewatch_peaks.groupby('segment'):
                if not segment_df.empty:
                    peak_idx = segment_df['rewatch'].idxmax()
                    peak_row = segment_df.loc[peak_idx]
                    repeated_segments.append({
                        "timestamp": peak_row['time'],
                        "rewatchIntensity": peak_row['rewatch']
                    })
            
            repeated_segments = sorted(repeated_segments, key=lambda x: x['rewatchIntensity'], reverse=True)[:5]
            repeated_segments_curve = df[['time', 'rewatch_viz']].rename(columns={'rewatch_viz': 'value'}).to_dict('records')

        # Interpolation for smooth curve
        num_points = 100
        time_interp = np.linspace(0, total_duration, num_points)
        value_interp = np.interp(time_interp, df['time'], df['value'])
        smoothed_values = pd.Series(value_interp).rolling(5, min_periods=1, center=True).mean()
        retention_curve = [{"time": t, "value": v} for t, v in zip(time_interp, smoothed_values)]
        raw_data_points = df[['time', 'value']].to_dict('records')

        result = {
            "averageRetention": float(average_retention), "totalDuration": float(total_duration),
            "volatilityScore": float(volatility_score) if pd.notna(volatility_score) else 0,
            "problemPoints": sorted(problem_points, key=lambda x: x['timestamp']),
            "strengthPoints": sorted(strength_points, key=lambda x: x['timestamp']),
            "repeatedSegments": sorted(repeated_segments, key=lambda x: x['timestamp']),
            "retentionCurve": retention_curve, "rawDataPoints": raw_data_points,
            "repeatedSegmentsCurve": repeated_segments_curve,
            "hookAnalysis": hook_analysis
        }
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)})

result_json = analyze_retention(
    csv_text=stats_text_py,
    absolute_duration=absolute_duration_py,
    dip_sensitivity=dip_sensitivity_py,
    peak_sensitivity_factor=peak_sensitivity_factor_py
)
result_json
    `;
    
    try {
        pyodide.globals.set("stats_text_py", statsText);
        pyodide.globals.set("absolute_duration_py", absoluteVideoDuration);
        pyodide.globals.set("dip_sensitivity_py", dipSensitivity);
        pyodide.globals.set("peak_sensitivity_factor_py", peakSensitivityFactor);
        
        const resultJson = await pyodide.runPythonAsync(pythonCode);
        const result = JSON.parse(resultJson);
        
        if (result.error) {
            logger.error('Ошибка выполнения Python-скрипта анализа', result.error);
            throw new Error(`Python analysis failed: ${result.error}`);
        }
        
        logger.info("Анализ данных в Pyodide успешно завершен.", {
            problems: result.problemPoints.length,
            strengths: result.strengthPoints.length,
            rewatches: result.repeatedSegments.length
        });

        return {
            averageCTR: 0, 
            ...result,
        };

    } catch (e) {
        logger.error("Критическая ошибка выполнения кода в Pyodide", e);
        console.error("Error executing Python code in Pyodide:", e);
        throw new Error("Failed to analyze data with the Python engine. See console for details.");
    }
};