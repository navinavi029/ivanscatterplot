const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

// Set up the dimensions and margins
const margin = { top: 60, right: 60, bottom: 60, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create the SVG container
const svg = d3.select('#graph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select('#tooltip');

// Fetch and process the data
d3.json(url).then(data => {
    // Parse the time strings into Date objects
    data.forEach(d => {
        const [minutes, seconds] = d.Time.split(':');
        d.Time = new Date(1970, 0, 1, 0, minutes, seconds);
    });

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
        .range([0, width]);

    const yScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))
        .range([0, height]);

    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%M:%S'));

    // Add x-axis
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

    // Add y-axis
    svg.append('g')
        .attr('id', 'y-axis')
        .call(yAxis);

    // Add dots
    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 6)
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(d.Time))
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => d.Time.toISOString())
        .style('fill', d => d.Doping ? '#ff4444' : '#4444ff')
        .on('mouseover', (event, d) => {
            tooltip
                .style('opacity', 1)
                .attr('data-year', d.Year)
                .html(`
                    ${d.Name}: ${d.Nationality}<br/>
                    Year: ${d.Year}, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds().toString().padStart(2, '0')}
                    ${d.Doping ? '<br/><br/>' + d.Doping : ''}
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    // Add legend
    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', 200)
        .attr('height', 50);

    legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 20)
        .attr('r', 6)
        .style('fill', '#ff4444');

    legend.append('text')
        .attr('x', 40)
        .attr('y', 25)
        .text('Riders with doping allegations')
        .style('font-size', '12px');

    legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 40)
        .attr('r', 6)
        .style('fill', '#4444ff');

    legend.append('text')
        .attr('x', 40)
        .attr('y', 45)
        .text('No doping allegations')
        .style('font-size', '12px');
}); 