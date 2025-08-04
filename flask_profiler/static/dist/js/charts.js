// Initialize ECharts instances
let pieChart = echarts.init(document.getElementById('pieChart'));
let lineChart = echarts.init(document.getElementById('lineChart'));

// Pie Chart Configuration
function updatePieChart(data) {
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [{
            type: 'pie',
            radius: '70%',
            data: data,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    pieChart.setOption(option);
}

// Line Chart Configuration
function updateLineChart(labels, data) {
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: data,
            type: 'line',
            smooth: true,
            areaStyle: {
                opacity: 0.3
            }
        }]
    };
    lineChart.setOption(option);
}

// Handle window resize
window.addEventListener('resize', function() {
    pieChart.resize();
    lineChart.resize();
});

// Export functions for use in main.js
window.updatePieChart = updatePieChart;
window.updateLineChart = updateLineChart;