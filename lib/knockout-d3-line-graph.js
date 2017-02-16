/*global ko, d3, define*/
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('knockout'), require('d3'));
    } else if (typeof define === 'function' && define.amd) {
        define(['knockout', 'd3'], factory);
    } else {
        factory(ko, d3);
    }
}
    (this, function (ko, d3) {

        function getPaintingMethods(data, element, options) {
            var yDomain = [undefined, undefined];
            var dataDomain = d3.extent(data, options.y);
            var baseLineDomain = options.showBaseLine ? d3.extent(data, options.baseLine) : [undefined, undefined];

            if(options.yDomain !== undefined && options.yDomain.length === 2) {
                yDomain[0] = options.yDomain[0];
                yDomain[1] = options.yDomain[1];
            }

            if (yDomain[0] === undefined) {
                yDomain[0] = options.showBaseLine ? Math.min(dataDomain[0], baseLineDomain[0])
                    : dataDomain[0];
            }

            if(yDomain[1] === undefined){
                yDomain[1] = options.showBaseLine ? Math.max(dataDomain[1], baseLineDomain[1])
                    : dataDomain[1];
            }

            if(options.yDomainMargin !== undefined)
            {
                yDomain[0] -= options.yDomainMargin;
                yDomain[1] += options.yDomainMargin;
            }

            var elementRect = element.getBoundingClientRect(),
                padding = options.padding(),
                width = elementRect.width - padding.left - padding.right,
                height = elementRect.height - padding.top - padding.bottom,
                scalerX = options.xScale().domain(d3.extent(data, options.x)).range([0, width]),
                scalerY = options.yScale().domain(yDomain).range([height, 0]);

            return {
                line: d3.svg.line().interpolate('basis')
                    .x(function (d, i) { return scalerX(options.x(d, i)); })
                    .y(function (d) { return scalerY(options.y(d)); }),
                area: d3.svg.area().interpolate('basis')
                    .x(function (d, i) { return scalerX(options.x(d, i)); })
                    .y0(height)
                    .y1(function (d) { return scalerY(options.y(d)); }),
                scaleX: scalerX,
                scaleY: scalerY,
                baseLine: d3.svg.line().interpolate('basis')
                    .x(function (d, i) { return scalerX(options.x(d, i)); })
                    .y(function (d) { return scalerY(options.baseLine(d)); }),
                baseLineArea: d3.svg.area().interpolate('basis')
                    .x(function (d, i) { return scalerX(options.x(d, i)); })
                    .y0(function (d) { return scalerY(options.baseLine(d)); })
                    .y1(height)
            };
        }


        ko.bindingHandlers.d3LineGraph = {
            init: function (element, valueAccessor, allBindings) {
                var options = {};
                ko.utils.extend(options, ko.bindingHandlers.d3LineGraph.options);
                ko.utils.extend(options, allBindings.get('d3LineGraph'));

                var bindingContext = ko.utils.unwrapObservable(valueAccessor());
                var elementRect = element.getBoundingClientRect();
                var data = bindingContext.value ? bindingContext.value() : bindingContext;
                var padding = options.padding();

                var shapes = getPaintingMethods(data, element, options);

                var svg = d3.select(element).append('svg');

                svg.attr('width', elementRect.width)
                    .attr('height', elementRect.height);

                var plot = svg.append("g")
                    .attr("class", "plot")
                    .attr("width", elementRect.width - padding.left - padding.right + 1)
                    .attr("height", elementRect.height - padding.top - padding.bottom + 1)
                    .attr("transform", "translate(" + (padding.left + 1) + "," + (padding.top - 1) + ")");

                plot.append("rect").attr("class", "bg").attr("width", elementRect.width - padding.left - padding.right)
                    .attr("height", elementRect.height - padding.top - padding.bottom)
                    .attr("fill", "none");

                plot.append('path').attr('class', 'area').attr('d', shapes.area(data));
                plot.append('path').attr('class', 'path').attr('d', shapes.line(data));

                if (options.showAxes) {
                    var xAxis = d3.svg.axis()
                        .scale(shapes.scaleX)
                        .orient("bottom");

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(" + padding.left + "," + (elementRect.height - padding.bottom) + ")")
                        .call(xAxis);

                    var yAxis = d3.svg.axis()
                        .scale(shapes.scaleY)
                        .orient("left");

                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                        .call(yAxis);
                }

                if (options.showBaseLine) {
                    plot.append('path').attr('class', 'baseline').attr('d', shapes.baseLine(data));
                    plot.append('path').attr('class', 'baselinearea').attr('d', shapes.baseLineArea(data));
                }
            },
            update: function (element, valueAccessor, allBindings) {
                var options = {};
                ko.utils.extend(options, ko.bindingHandlers.d3LineGraph.options);
                ko.utils.extend(options, allBindings.get('d3LineGraph'));
                var bindingContext = ko.utils.unwrapObservable(valueAccessor());
                var data = bindingContext.value ? bindingContext.value() : bindingContext;
                var shapes = getPaintingMethods(data, element, options);

                var svg = d3.select(element).select('svg');

                if (options.showAxes) {
                    var xAxis = d3.svg.axis()
                        .scale(shapes.scaleX)
                        .orient("bottom");

                    options.xAxisOptions(xAxis);

                    svg.select("g.x")
                        .interrupt()
                        .transition()
                        .ease('linear')
                        .duration(250)
                        .call(xAxis);

                    var yAxis = d3.svg.axis()
                        .scale(shapes.scaleY)
                        .orient("left");

                    options.yAxisOptions(yAxis);

                    svg.select("g.y")
                        .interrupt()
                        .transition()
                        .ease('linear')
                        .duration(250)
                        .call(yAxis);
                }

                if (options.showBaseLine) {
                    svg.select('path.baseline')
                        .interrupt()
                        .transition()
                        .ease('linear')
                        .duration(250)
                        .attr('d', shapes.baseLine(data));

                    svg.select('path.baselinearea')
                        .interrupt()
                        .transition()
                        .ease('linear')
                        .duration(250)
                        .attr('d', shapes.baseLineArea(data));
                }

                svg.select('path.area')
                    .interrupt()
                    .transition()
                    .ease('linear')
                    .duration(250)
                    .attr('d', shapes.area(data));

                svg.select('path.path')
                    .interrupt()
                    .transition()
                    .ease('linear')
                    .duration(250)
                    .attr('d', shapes.line(data));
            },
            options: {
                showAxes: false,
                padding: function () {
                    return this.showAxes ? { top: 15, right: 20, left: 40, bottom: 25 } : { top: 0, right: 0, left: 0, bottom: 0 };
                },
                x: function (d, i) { return i; },
                y: function (d) { return d; },
                xScale: d3.scale.linear,
                yScale: d3.scale.linear,
                xAxisOptions: function (axis) { },
                yAxisOptions: function (axis) { },
                baseLine: function (d) { return d; },
                showBaseLine: false,
                yDomain: [undefined, undefined],
                yDomainMargin: undefined
            }
        };

        return ko.bindingHandlers.d3LineGraph;
    }));
