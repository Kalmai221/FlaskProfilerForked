var profile = {
    config: {
        dataLength: 0
    },
    columnsIndex: {
        grouped: ["method", "name", "count", "avgElapsed", "maxElapsed", "minElapsed"],
        filter: ["method", "name", "elapsed", "startedAt"]
    },
    dateTime: {
        startedAt: moment().subtract(6, "days").unix(),
        endedAt: moment().unix()
    },
    // Get data from API based on the selected grouping (either 'grouped' or 'filtered')
    getData: function(groupingType = "grouped") {
        const queryParams = this.createQueryParams(groupingType);
        let responseData;

        $.ajax({
            type: "GET",
            async: false,
            url: `api/measurements/${groupingType === "grouped" ? groupingType + "/" : ""}`,
            dataType: "json",
            data: queryParams,
            success: (response) => {
                responseData = this.classifyData(response.measurements);
                this.createdTime = moment();
            }
        });

        return responseData;
    },
    // Classifies the data and prepares it for DataTable
    classifyData: function(measurements) {
        const ajaxData = measurements || [];
        const rowCount = Object.keys(ajaxData).length;
        const dataTableOption = this.dataTableOption;

        return {
            draw: dataTableOption.draw,
            recordsFiltered: rowCount,
            recordsTotal: rowCount,
            data: ajaxData
        };
    },
    // Creates the query parameters for the API based on the grouping type
    createQueryParams: function(groupingType, dataTableOptions = this.dataTableOption) {
        const order = dataTableOptions.order[0];
        const columns = groupingType === "filtered" ? this.columnsIndex.filter : this.columnsIndex.grouped;
        const filters = {
            sort: `${columns[order.column]},${order.dir}`,
            skip: dataTableOptions.start,
            limit: dataTableOptions.length,
            startedAt: this.dateTime.startedAt,
            endedAt: this.dateTime.endedAt
        };

        if (groupingType === "filtered") {
            const methodFilter = $("#filteredTable select.method").val() || "ALL";
            filters.method = methodFilter === "ALL" ? "" : methodFilter;
            filters.name = $("#filteredTable input.filtered-name").val();
            filters.elapsed = $("#filteredTable input.elapsed").val() || 0;
        }

        return filters;
    },
    // Centralized AJAX handling for charts
    fetchChartData: function(apiUrl, params, callback) {
        $.ajax({
            type: "GET",
            async: true,
            url: apiUrl,
            dataType: "json",
            data: params,
            success: callback
        });
    }
};

window.profile = profile;
window.dayFilterValue = "day";

// Initialize filtered table with DataTable plugin
function setFilteredTable() {
    const table = $("#filteredTable").DataTable({
        processing: true,
        serverSide: true,
        ajax: (data, callback) => {
            window.profile.dataTableOption = data;
            callback(window.profile.getData("filtered"));
        },
        responsive: false,
        paging: true,
        pageLength: 100,
        dom: "Btrtip",
        stateSave: true,
        order: [[3, "desc"]],
        autoWidth: false,
        language: {
            processing: "Loading...",
            buttons: {
                colvis: '<span class="glyphicon glyphicon-filter"></span>'
            }
        },
        buttons: [{
            extend: "colvis",
            columns: [":gt(1)"]
        }],
        columns: [
            {
                title: "method",
                data: (row) => `<span class="row--method ${row.method.toLowerCase()}">${row.method}</span>`,
                class: "method",
                orderable: false
            },
            {
                title: "name",
                data: (row, type) => {
                    const div = document.createElement("div");
                    div.innerText = row.name;
                    return type === "display" ? `<span data-json='${JSON.stringify(row.context)}'>${div.innerHTML}</span>` : div.innerHTML;
                },
                class: "name",
                orderable: false
            },
            {
                title: "elapsed",
                data: (row) => row.elapsed.toString().slice(0, 8),
                class: "elapsed number"
            },
            {
                title: "startedAt",
                data: (row) => moment.unix(row.startedAt).format("DD/MM/YYYY h:mm:ss.MS A"),
                class: "startedAt"
            }
        ],
        initComplete: function() {
            $("#filteredTable>thead").append($("#filteredTable .filter-row"));
            $(".filtered-datepicker").daterangepicker({
                timePicker: true,
                timePickerSeconds: true,
                startDate: moment.unix(window.profile.dateTime.startedAt).format("MM/DD/YYYY"),
                endDate: moment.unix(window.profile.dateTime.endedAt).format("MM/DD/YYYY")
            }, (start, end) => {
                profile.dateTime = { startedAt: start.unix(), endedAt: end.unix() };
                table.draw();
            });
            $("#filteredTable").removeClass("loading");
        },
        drawCallback: function() {
            $("#filteredTable tbody").on("click", "tr", function() {
                $(".filteredModal .modal-body").JSONView(JSON.stringify($(this).find("[data-json]").data("json")));
                $(".filteredModal").modal("show");
            });
            $("#filteredTable").removeClass("loading");
            $("html").animate({ scrollTop: 0 }, 300);
        }
    });

    // Filter and clear filter handlers
    $("#filteredTable select.method, #filteredTable input.filtered-name, #filteredTable input.elapsed").off().on("input", function() {
        $("#filteredTable").addClass("loading");
        table.draw();
    });

    $(".clear-filter").off().on("click", function() {
        const dateRangePicker = $(".filtered-datepicker");
        $("#filteredTable select.method").val("ALL");
        $("#filteredTable input.filtered-name").val("");
        $("#filteredTable input.elapsed").val("");
        dateRangePicker.data("daterangepicker").setStartDate(moment().subtract(7, "days").format("MM/DD/YYYY"));
        dateRangePicker.data("daterangepicker").setEndDate(moment().format("MM/DD/YYYY"));
        table.draw();
    });
}

// Get charts with pie and line chart data
function getCharts() {
    const params = {
        startedAt: window.profile.dateTime.startedAt,
        endedAt: window.profile.dateTime.endedAt
    };

    // Fetch method distribution chart (pie chart)
    profile.fetchChartData("api/measurements/methodDistribution/", params, (response) => {
        const chartData = Object.entries(response.distribution).map(([key, value]) => [key, value]);
        c3.generate({
            bindto: "#pieChart",
            data: {
                columns: chartData,
                type: "pie",
                colors: { GET: "#4BB74B", PUT: "#0C8DFB", DELETE: "#FB6464", POST: "#2758E4" }
            },
            color: { pattern: ["#9A9A9A"] }
        });
        $("#pieChart").removeClass("loading");
    });

    // Fetch timeseries chart (line chart)
    const timeseriesParams = {
        interval: window.dayFilterValue === "hours" ? "hourly" : "daily",
        startedAt: window.profile.dateTime.startedAt,
        endedAt: window.profile.dateTime.endedAt
    };

    profile.fetchChartData("api/measurements/timeseries/", timeseriesParams, (response) => {
        const series = response.series;
        const dataColumns = ["data", ...Object.values(series)];
        const categories = window.dayFilterValue === "hours"
            ? Object.keys(series).map(key => key.substr(-2))
            : Object.keys(series);

        c3.generate({
            bindto: "#lineChart",
            data: { columns: [dataColumns], type: "area" },
            axis: { x: { type: "category", categories } },
            color: { pattern: ["#EC5B19"] }
        });
        $("#lineChart").removeClass("loading");
    });
}

// Initialize the page
$(document).ready(function() {
    $('a[data-toggle="tab"]').historyTabs();
    getCharts();
    setFilteredTable();
    
    // Auto-update created time
    function updateCreatedTime() {
        $(".created-time").text(`Created ${moment(profile.createdTime).fromNow()}`);
        setTimeout(updateCreatedTime, 5000);
    }
    updateCreatedTime();
});
