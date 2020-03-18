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
 * under the License. */

import classNames from 'classnames';
import React from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import { getFinalTooltipPosition, TooltipAnchorPosition } from './utils';
import { TooltipInfo } from './types';
import { TooltipValueFormatter, TooltipValue } from '../../specs';
import { GlobalChartState, BackwardRef } from '../../state/chart_state';
import { isInitialized } from '../../state/selectors/is_initialized';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getTooltipHeaderFormatterSelector } from '../../state/selectors/get_tooltip_header_formatter';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';

interface TooltipStateProps {
  isVisible: boolean;
  position: TooltipAnchorPosition | null;
  info?: TooltipInfo;
  headerFormatter?: TooltipValueFormatter;
}
interface TooltipOwnProps {
  getChartContainerRef: BackwardRef;
}

type TooltipProps = TooltipStateProps & TooltipOwnProps;

class TooltipComponent extends React.Component<TooltipProps> {
  static displayName = 'Tooltip';
  portalNode: HTMLDivElement | null = null;
  tooltipRef: React.RefObject<HTMLDivElement>;

  constructor(props: TooltipProps) {
    super(props);
    this.tooltipRef = React.createRef();
  }
  createPortalNode() {
    const container = document.getElementById('echTooltipContainerPortal');
    if (container) {
      this.portalNode = container as HTMLDivElement;
    } else {
      this.portalNode = document.createElement('div');
      this.portalNode.id = 'echTooltipContainerPortal';
      document.body.appendChild(this.portalNode);
    }
  }
  componentDidMount() {
    this.createPortalNode();
  }

  componentDidUpdate() {
    this.createPortalNode();
    const { getChartContainerRef, position } = this.props;
    const chartContainerRef = getChartContainerRef();

    if (!this.tooltipRef.current || !chartContainerRef.current || !this.portalNode || !position) {
      return;
    }

    const chartContainerBBox = chartContainerRef.current.getBoundingClientRect();
    const tooltipBBox = this.tooltipRef.current.getBoundingClientRect();
    const tooltipStyle = getFinalTooltipPosition(chartContainerBBox, tooltipBBox, position);

    if (tooltipStyle.left) {
      this.portalNode.style.left = tooltipStyle.left;
    }
    if (tooltipStyle.top) {
      this.portalNode.style.top = tooltipStyle.top;
    }
  }

  componentWillUnmount() {
    if (this.portalNode && this.portalNode.parentNode) {
      this.portalNode.parentNode.removeChild(this.portalNode);
    }
  }

  renderHeader(headerData: TooltipValue | null, formatter?: TooltipValueFormatter) {
    if (!headerData || !headerData.isVisible) {
      return null;
    }
    return <div className="echTooltip__header">{formatter ? formatter(headerData) : headerData.value}</div>;
  }

  render() {
    const { isVisible, info, headerFormatter, getChartContainerRef } = this.props;
    const chartContainerRef = getChartContainerRef();
    if (!this.portalNode || chartContainerRef.current === null || !isVisible || !info) {
      return null;
    }
    const tooltipComponent = (
      <div className="echTooltip" ref={this.tooltipRef}>
        {this.renderHeader(info.header, headerFormatter)}
        <div className="echTooltip__list">
          {info.values.map(({ seriesIdentifier, valueAccessor, label, value, color, isHighlighted, isVisible }) => {
            if (!isVisible) {
              return null;
            }
            const classes = classNames('echTooltip__item', {
              /* eslint @typescript-eslint/camelcase:0 */
              echTooltip__rowHighlighted: isHighlighted,
            });
            return (
              <div
                key={`${seriesIdentifier.key}__${valueAccessor}`}
                className={classes}
                style={{
                  borderLeftColor: color,
                }}
              >
                <span className="echTooltip__label">{label}</span>
                <span className="echTooltip__value">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
    return createPortal(tooltipComponent, this.portalNode);
  }
}

const HIDDEN_TOOLTIP_PROPS = {
  isVisible: false,
  info: undefined,
  position: null,
  headerFormatter: undefined,
};

const mapStateToProps = (state: GlobalChartState): TooltipStateProps => {
  if (!isInitialized(state)) {
    return HIDDEN_TOOLTIP_PROPS;
  }
  return {
    isVisible: getInternalIsTooltipVisibleSelector(state),
    info: getInternalTooltipInfoSelector(state),
    position: getInternalTooltipAnchorPositionSelector(state),
    headerFormatter: getTooltipHeaderFormatterSelector(state),
  };
};

/** @internal */
export const Tooltip = connect(mapStateToProps)(TooltipComponent);
