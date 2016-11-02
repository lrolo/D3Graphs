$(document).ready(function(){

    d3.json("https://cloudops-apps-dev.outsystemsenterprise.com/Sherlock/rest/D3_VisualizeAPI/Asset_Visualize?Identifier=b34656a4f73aa09a7c9cd013ef8bb07ed2ef46530e97b61d14461f7a", function(error, json) {

        var imageBucket = 'https://s3-us-west-2.amazonaws.com/monitoring-asset-icons';

        if (error) console.warn(error);

        var root = json;

        var width = 960,
            height = 1000;

        var svg = d3.select('body')
            .append("svg")
            .attr('width', width)
            .attr('height', height);

        var graph = root;

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var width = 960;
        var height = 1000;
        var img_w = 50;
        var img_h = 50;
        //var k = Math.sqrt(root.nodes.length / (width * height));

        var simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function(d) {
                return d.Identifier;
            }).distance (10))
            .force('charge', d3.forceManyBody().strength(-width * 2))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(20))
            .force('y', d3.forceY())
            .force('x', d3.forceX());

        var link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graph.links)
            .enter().append('line');

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function(d) {

                var attributeList = '';

                if (d.AttributeList.hasOwnProperty('MachineType')){
                    attributeList += '<p>Machine type: '+ d.AttributeList.MachineType +'</p>';
                }

                if (d.AttributeList.hasOwnProperty('ActivationCode')){
                    attributeList += '<p>Activation Code: '+ d.AttributeList.ActivationCode + '</p>';
                }

                if (d.AttributeList.hasOwnProperty('InternalHostname')){
                    attributeList += '<p>Internal Hostname: '+ d.AttributeList.InternalHostname+'</p>';
                }

                if (d.AttributeList.hasOwnProperty('LifecycleState')){
                    attributeList += '<p>Lifecycle State: '+ d.AttributeList.LifecycleState+'</p>';
                }

                if (d.AttributeList.hasOwnProperty('Serial')){
                    attributeList += '<p>Serial: '+ d.AttributeList.Serial+'</p>';
                }

                if (d.AttributeList.hasOwnProperty('EnvironmentType')){
                    attributeList += '<p>Environment: '+ d.AttributeList.EnvironmentType+'</p>';
                }

                if (d.AttributeList.hasOwnProperty('Arn')){
                    attributeList += '<p>Arn: '+ d.AttributeList.Arn+'</p>';
                }

                if (d.AttributeList.hasOwnProperty('ServerRole')){
                    attributeList += '<p>Server: '+ d.AttributeList.ServerRole+'</p>';
                }

                return '<div>' +
                    '<h1>'+ d.Name+'</h1><hr>' +
                    '<h2>'+ d.Type+'</h2>' +
                    '<div>'+ attributeList+'</div>' +
                    '</div>';
            });

        svg.call(tip);

        var node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graph.nodes)
            .enter().append('image')
            .attr('width', img_w)
            .attr('height', img_h)
            .attr('xlink:href', function(d) {
                return imageBucket + '/' + d.Type + '.png';
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        /*
        var nodes_text = svg.selectAll('.nodetext')
            .data(graph.nodes)
            .enter()
            .append('text')
            .attr('class', 'nodetext slds-text-heading--label')
            .attr('text-anchor', 'middle')
            .attr('dx', -20)
            .attr('dy', 10)
            .text(function(d) {
                return d.Name;
            });
        */

    simulation
        .nodes(graph.nodes)
        .on('tick', ticked);

    simulation.force('link')
        .links(graph.links);

    function ticked() {

        var k = 10 * simulation.alpha();


        link
            .each(function(d) {
                d.source.y -= k, d.target.y += k;
            })
            .attr('x1', function(d) {
                var xPos = d.source.x;
                if (xPos < 0) return 0;
                if (xPos > (width - img_w)) return (height - img_w);
                return xPos;
            })
            .attr('y1', function(d) {
                var yPos = d.source.y;
                if (yPos < 0) return 0;
                if (yPos > (width - img_h)) return (height - img_h);
                return yPos;
            })
            .attr('x2', function(d) {
                var xPos = d.target.x;
                if (xPos < 0) return 0;
                if (xPos > (width - img_w)) return (height - img_w);
                return xPos;
            })
            .attr('y2', function(d) {
                var yPos = d.target.y;
                if (yPos < 0) return 0;
                if (yPos > (width - img_h)) return (height - img_h);
                return yPos;
            });


        node
            .attr('x', function(d) {
                var xPos = (d.x - img_w /2);
                if (xPos < 0) return 0;
                if (xPos > (width - img_w)) return (height - img_w);
                return xPos;
            })
            .attr('y', function(d) {
                var yPos = d.y - img_h;
                if (yPos < 0) return 0;
                if (yPos > (width - img_h)) return (height - img_h);
                return yPos;
            });

        /*
        nodes_text
            .attr('x', function(d) {
                return d.x + 20
            })
            .attr('y', function(d) {
                return d.y + img_w / 2;
            });
        */
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.1).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

    });

});
