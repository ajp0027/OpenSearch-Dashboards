/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { ComponentType } from 'react';

import { Spec } from '.';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { XYChartSeriesIdentifier } from '../chart_types/xy_chart/utils/series';
import { DomainRange } from '../chart_types/xy_chart/utils/specs';
import { SeriesIdentifier } from '../commons/series_id';
import { TooltipPortalSettings } from '../components/portal';
import { CustomTooltip } from '../components/tooltip/types';
import { ScaleContinuousType, ScaleOrdinalType } from '../scales';
import { getConnect, specComponentFactory } from '../state/spec_factory';
import { Accessor } from '../utils/accessor';
import { Position, Rendering, Rotation, Color, RecursivePartial } from '../utils/commons';
import { Domain } from '../utils/domain';
import { GeometryValue } from '../utils/geometry';
import { GroupId } from '../utils/ids';
import { PartialTheme, Theme } from '../utils/themes/theme';
import { PointerEventType, TooltipType, BrushAxis, DEFAULT_SETTINGS_SPEC } from './constants';

export interface LayerValue {
  groupByRollup: PrimitiveValue;
  value: number;
}

export interface GroupBrushExtent {
  groupId: GroupId;
  extent: [number, number];
}
export interface XYBrushArea {
  x?: [number, number];
  y?: Array<GroupBrushExtent>;
}

export type XYChartElementEvent = [GeometryValue, XYChartSeriesIdentifier];
export type PartitionElementEvent = [Array<LayerValue>, SeriesIdentifier];

export type ElementClickListener = (elements: Array<XYChartElementEvent | PartitionElementEvent>) => void;
export type ElementOverListener = (elements: Array<XYChartElementEvent | PartitionElementEvent>) => void;
export type BrushEndListener = (brushArea: XYBrushArea) => void;
export type LegendItemListener = (series: SeriesIdentifier | null) => void;
export type PointerUpdateListener = (event: PointerEvent) => void;
/**
 * Listener to be called when chart render state changes
 *
 * `isRendered` value is `true` when rendering is complete and `false` otherwise
 */
export type RenderChangeListener = (isRendered: boolean) => void;
export type BasicListener = () => undefined | void;

export interface BasePointerEvent {
  chartId: string;
  type: PointerEventType;
}
/**
 * Event used to syncronize pointers/mouse positions between Charts.
 *
 * fired as callback argument for `PointerUpdateListener`
 */
export interface PointerOverEvent extends BasePointerEvent {
  type: typeof PointerEventType.Over;
  scale: ScaleContinuousType | ScaleOrdinalType;
  /**
   * Unit for event (i.e. `time`, `feet`, `count`, etc.) Not currently used/implemented
   * @alpha
   */
  unit?: string;
  value: number | string | null;
}
export interface PointerOutEvent extends BasePointerEvent {
  type: typeof PointerEventType.Out;
}

export type PointerEvent = PointerOverEvent | PointerOutEvent;

/**
 * This interface describe the properties of single value shown in the tooltip
 * @public
 */
export interface TooltipValue {
  /**
   * The label of the tooltip value
   */
  label: string;
  /**
   * The value to display
   */
  value: any;
  /**
   * The mark value to display
   */
  markValue?: any;
  /**
   * The color of the graphic mark (by default the color of the series)
   */
  color: Color;
  /**
   * True if the mouse is over the graphic mark connected to the tooltip
   */
  isHighlighted: boolean;
  /**
   * True if the tooltip is visible, false otherwise
   */
  isVisible: boolean;
  /**
   * The idenfitier of the related series
   */
  seriesIdentifier: SeriesIdentifier;
  /**
   * The accessor linked to the current tooltip value
   */
  valueAccessor?: Accessor;
}

/**
 * A value formatter of a {@link TooltipValue}
 * @public
 */
export type TooltipValueFormatter = (data: TooltipValue) => JSX.Element | string;

/**
 * The advanced configuration for the tooltip
 * @public
 */
export type TooltipProps = TooltipPortalSettings<'chart'> & {
  /**
   * The {@link (TooltipType:type) | TooltipType} of the tooltip
   */
  type?: TooltipType;
  /**
   * Whenever the tooltip needs to snap to the x/band position or not
   */
  snap?: boolean;
  /**
   * A {@link TooltipValueFormatter} to format the header value
   */
  headerFormatter?: TooltipValueFormatter;
  /**
   * Unit for event (i.e. `time`, `feet`, `count`, etc.).
   * Not currently used/implemented
   *
   * @alpha
   */
  unit?: string;
  /**
   * Render custom tooltip given header and values
   */
  customTooltip?: CustomTooltip;
};

/**
 * Either a {@link (TooltipType:type)} or an {@link (TooltipProps:type)} configuration
 * @public
 */
export type TooltipSettings = TooltipType | TooltipProps;

/**
 * The settings for handling external events.
 * @alpha
 */
export interface ExternalPointerEventsSettings {
  /**
   * Tooltip settings used for external events
   */
  tooltip: TooltipPortalSettings<'chart'> & {
    /**
     * `true` to show the tooltip when the chart receive an
     * external pointer event, 'false' to hide the tooltip.
     * @defaultValue `false`
     */
    visible?: boolean;
  }
}

/**
 * Legend action component props
 *
 * @public
 */
export interface LegendActionProps {
  /**
   * Series identifier for the given series
   */
  series: SeriesIdentifier;
}
/**
 * Legend action component used to render actions next to legend items
 *
 * @public
 */
export type LegendAction = ComponentType<LegendActionProps>;

export interface LegendColorPickerProps {
  /**
   * Anchor used to position picker
   */
  anchor: HTMLElement;
  /**
   * Current color of the given series
   */
  color: Color;
  /**
   * Callback to close color picker and set persistent color
   */
  onClose: () => void;
  /**
   * Callback to update temporary color state
   */
  onChange: (color: Color) => void;
  /**
   * Series id for the active series
   */
  seriesIdentifier: SeriesIdentifier;
}
export type LegendColorPicker = ComponentType<LegendColorPickerProps>;

/**
 * Buffer between cursor and point to trigger interaction
 */
export type MarkBuffer = number | ((radius: number) => number);

/**
 * The Spec used for Chart settings
 * @public
 */
export interface SettingsSpec extends Spec {
  /**
   * Partial theme to be merged with base
   *
   * or
   *
   * Array of partial themes to be merged with base
   * index `0` being the hightest priority
   *
   * i.e. `[primary, secondary, tertiary]`
   */
  theme?: PartialTheme | PartialTheme[];
  /**
   * Full default theme to use as base
   *
   * @defaultValue `LIGHT_THEME`
   */
  baseTheme?: Theme;
  rendering: Rendering;
  rotation: Rotation;
  animateData: boolean;
  showLegend: boolean;
  /**
   * The tooltip configuration {@link TooltipSettings}
   */
  tooltip: TooltipSettings;
  /**
   * {@inheritDoc ExternalPointerEventsSettings}
   * @alpha
   */
  externalPointerEvents: ExternalPointerEventsSettings;
  debug: boolean;
  legendPosition: Position;
  /**
   * Show an extra parameter on each legend item defined by the chart type
   * @defaultValue `false`
   */
  showLegendExtra: boolean;
  /**
   * Limit the legend to a max depth when showing a hierarchical legend
   */
  legendMaxDepth?: number;
  /**
   * Display the legend as a flat hierarchy
   */
  flatLegend?: boolean;
  /**
   * Removes duplicate axes
   *
   * Compares title, position and first & last tick labels
   */
  hideDuplicateAxes: boolean;
  onElementClick?: ElementClickListener;
  onElementOver?: ElementOverListener;
  onElementOut?: BasicListener;
  pointBuffer?: MarkBuffer;
  onBrushEnd?: BrushEndListener;
  onLegendItemOver?: LegendItemListener;
  onLegendItemOut?: BasicListener;
  onLegendItemClick?: LegendItemListener;
  onLegendItemPlusClick?: LegendItemListener;
  onLegendItemMinusClick?: LegendItemListener;
  onPointerUpdate?: PointerUpdateListener;
  onRenderChange?: RenderChangeListener;
  xDomain?: Domain | DomainRange;
  resizeDebounce?: number;
  /**
   * Render slot to render action for legend
   */
  legendAction?: LegendAction;
  legendColorPicker?: LegendColorPicker;
  /**
   * Block the brush tool on a specific axis: x, y or both.
   * @defaultValue `x` {@link (BrushAxis:type) | BrushAxis.X}
   */
  brushAxis?: BrushAxis;
  /**
   * The minimum number of pixel to consider for a valid brush event (in both axis if brushAxis prop is BrushAxis.Both).
   * E.g. a min value of 2 means that the brush area needs to be at least 2 pixel wide and 2 pixel tall.
   * @defaultValue 2
   */
  minBrushDelta?: number;
}

export type DefaultSettingsProps =
  | 'id'
  | 'chartType'
  | 'specType'
  | 'rendering'
  | 'rotation'
  | 'resizeDebounce'
  | 'animateData'
  | 'showLegend'
  | 'debug'
  | 'tooltip'
  | 'showLegendExtra'
  | 'theme'
  | 'legendPosition'
  | 'hideDuplicateAxes'
  | 'brushAxis'
  | 'minBrushDelta'
  | 'externalPointerEvents';

export type SettingsSpecProps = Partial<Omit<SettingsSpec, 'chartType' | 'specType' | 'id' | 'externalPointerEvents'>> & {
  externalPointerEvents?: RecursivePartial<SettingsSpec['externalPointerEvents']>
};

export const Settings: React.FunctionComponent<SettingsSpecProps> = getConnect()(
  specComponentFactory<SettingsSpec, DefaultSettingsProps>(DEFAULT_SETTINGS_SPEC),
);

/** @internal */
export function isPointerOutEvent(event: PointerEvent | null | undefined): event is PointerOutEvent {
  return event !== null && event !== undefined && event.type === PointerEventType.Out;
}

/** @internal */
export function isPointerOverEvent(event: PointerEvent | null | undefined): event is PointerOverEvent {
  return event !== null && event !== undefined && event.type === PointerEventType.Over;
}

/** @internal */
export function isTooltipProps(config: TooltipType | TooltipProps): config is TooltipProps {
  return typeof config === 'object';
}

/** @internal */
export function isTooltipType(config: TooltipType | TooltipProps): config is TooltipType {
  return typeof config === 'string';
}

/** @internal */
export function isCrosshairTooltipType(type: TooltipType) {
  return type === TooltipType.VerticalCursor || type === TooltipType.Crosshairs;
}

/** @internal */
export function isFollowTooltipType(type: TooltipType) {
  return type === TooltipType.Follow;
}

/** @internal */
export function getTooltipType(settings: SettingsSpec, externalTooltip = false): TooltipType {
  const defaultType = TooltipType.VerticalCursor;
  if (externalTooltip) {
    return getExternalTooltipType(settings);
  }
  const { tooltip } = settings;
  if (tooltip === undefined || tooltip === null) {
    return defaultType;
  }
  if (isTooltipType(tooltip)) {
    return tooltip;
  }
  if (isTooltipProps(tooltip)) {
    return tooltip.type || defaultType;
  }
  return defaultType;
}


/**
 * Always return a Vertical Cursor for external pointer events or None if hidden
 * @internal
 * @param settings - the SettingsSpec
 */
export function getExternalTooltipType({ externalPointerEvents: { tooltip: { visible } } }: SettingsSpec): TooltipType {
  return visible ? TooltipType.VerticalCursor : TooltipType.None;
}
