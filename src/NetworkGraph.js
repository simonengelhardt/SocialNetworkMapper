var NetworkGraph = (function () {
    var timerhandle;
    var showInfo = function (relation) {
        console.log(relation);
        $('text:contains("' + relation.source.name + '")').css('font-weight', 'bold');
        $('text:contains("' + relation.target.name + '")').css('font-weight', 'bold');
        var link = $(this);
        console.log(link);
        $('.infobox').css('top', link.position().top+40);
        $('.infobox').css('left', link.position().left+40);
        $('.infobox').fadeIn();
        $('.infobox .header').text(relation.source.name);
        
        $('.infobox .info').text((relation.active===0?"Former ":"")+  relation.role + ' in ' + relation.target.name);
    };

    var linkMouseOut = function (relation) {
        $('text:contains("' + relation.source.name + '")').css('font-weight', 'normal');
        $('text:contains("' + relation.target.name + '")').css('font-weight', 'normal');

        clearTimeout(timerhandle);
        timerhandle=setTimeout(function () {
            $('.infobox').fadeOut();

        }, 12000);
    }


    var start = function (_width, _height, _spreadsheetId) {
        $('.infobox').mouseover(function () {
            console.log('mouseover infobox');
            $('.infobox').css('top', $('.infobox').position().top + 50);
        });
        DataLoader.load(_spreadsheetId, function (links) {
            var nodes = {};
            if (links.toArray)
                links = links.toArray();
            console.log(links);
            // Compute the distinct nodes from the links.
            links.forEach(function (link) {
                link.source = nodes[link.source] || (nodes[link.source] = {
                    name: link.source,
                    nodetype: 'person'
                });
                link.target = nodes[link.target] || (nodes[link.target] = {
                    name: link.target,
                    nodetype: 'org',
                    orgtype: link.orgtype
                });
            });


            var width = _width || 960,
                height = _height || 500;

            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .size([width, height])
                .linkDistance(90)
                .charge(function (n) { 
                    return n.nodetype === 'person' ? -300 : -300;
                })
                .linkStrength(1)
                .on("tick", tick)
                .start();

            var svg = d3.select("body").append("svg").attr("width", width)
                .attr("height", height);

            var link = svg.selectAll(".link")
                .data(force.links())
                .enter().append("line")
                .attr("class", function (d) {
                    console.log(d);
                    return d.active === 1 ? "link active" : "link inactive"
                })
                .on('mouseover', showInfo)
                .on('mouseout', linkMouseOut);


            var node = svg.selectAll(".node")
                .data(force.nodes())
                .enter().append("g")
                .attr("class", function (d) {
                    console.log(d);
                    return "node " + d.nodetype + " "+ d.orgtype;
                })
                .call(force.drag);



            node.append("circle")
                .attr("r", 6);

            // adding label
            node.append("text")
                .attr("x", 12)
                .attr("dy", ".35em")
                .text(function (d) {
                    return d.name;
                }).on("mouseover", function () { console.log(this) });

            function tick() {
                link
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
            }
        });
    };
    return {
        start: start
    };
})();