var profile = {
    config: { dataLength: 0 },
    columnsIndex: {
        grouped: ["method", "name", "count", "avgElapsed", "maxElapsed", "minElapsed"],
        filter: ["method", "name", "elapsed", "startedAt"]
    },
    dateTime: {
        startedAt: moment().subtract(6, "days").unix(),
        endedAt: moment().unix()
    },
    getData: function (a, b) {
        a = a || "grouped";
        var c, d = this, b = this.createQueryParams(a);
        return $.ajax({
            type: "GET",
            async: false,
            url: "api/measurements/" + ("grouped" === a ? a + "/" : ""),
            dataType: "json",
            data: b,
            success: function (response) {
                c = d.dataTableClassifier(response.measurements);
                d.createdTime = moment();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data: ", status, error);
                alert("An error occurred while fetching data. Please try again.");
            },
            complete: function () {
                $("#filteredTable").removeClass("loading"); // Ensure loading state is cleared
            }
        }), c;
    },
    dataTableClassifier: function (a) {
        var b = this.dataTableOption;
        ajaxData = a.measurements || a;
        var c = Object.keys(ajaxData).length;
        return c = b.length === c ? b.length + b.start + c : b.start + c, {
            draw: b.draw,
            recordsFiltered: c,
            recordsTotal: c,
            data: ajaxData
        };
    },
    createQueryParams: function (a, b) {
        var c, d = b || this.dataTableOption, e = d.order[0], f = {};
        if ("filtered" === a) {
            var g = $("#filteredTable select.method").val();
            c = this.columnsIndex.filter, "ALL" === g && (g = ""),
            f.method = g,
            f.name = $("#filteredTable input.filtered-name").val(),
            f.elapsed = $("#filteredTable input.elapsed").val() || 0;
        } else {
            c = this.columnsIndex.grouped;
        }
        return f.sort = c[e.column] + "," + e.dir,
        f.skip = d.start,
        f.limit = d.length,
        f.startedAt = this.dateTime.startedAt,
        f.endedAt = this.dateTime.endedAt,
        f;
    }
};

window.profile = profile;
window.dayFilterValue = "days"; // Set default filter value to "days"
window.profile.dateTime = {
    startedAt: moment().subtract(7, "days").unix(), // Start date is set to 7 days ago
    endedAt: moment().unix() // End date is now
};

var setFilteredTable = function () {
    // Check if DataTable is already initialized and destroy it if it is
    if ($.fn.DataTable.isDataTable("#filteredTable")) {
        $("#filteredTable").DataTable().clear().destroy(); // Clear and destroy the existing DataTable
    }

    var a = $("#filteredTable").DataTable({
        processing: true,
        serverSide: true,
        ajax: function (a, b, c) {
            window.profile.dataTableOption = a;
            b(window.profile.getData("filtered"));
        },
        responsive: true,
        paging: true,
        pageLength: 10,
        dom: "Btrtip",
        stateSave: true,
        order: [3, "desc"],
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
                title: "Method",
                data: function (a) {
                    return '<span class="row--method ' + a.method.toLowerCase() + '">' + a.method + "</span>";
                },
                "class": "method",
                orderable: false
            },
            {
                title: "Route",
                data: function (a, b) {
                    var c = document.createElement("div");
                    return c.innerText = a.name,
                    "display" === b ? "<span data-json='" + JSON.stringify(a.context) + "'>" + c.innerHTML + "</span>" : c.innerHTML;
                },
                "class": "name",
                orderable: false
            },
            {
                title: "Elapsed",
                data: function (a) {
                    return a.elapsed.toString().slice(0, 8);
                },
                "class": "elapsed number"
            },
            {
                title: "Started At",
                data: function (a) {
                    return moment.unix(a.startedAt).format("DD/MM/YYYY");
                },
                "class": "startedAt"
            }
        ],
        initComplete: function () {
            $("#filteredTable>thead").append($("#filteredTable .filter-row"));

            // Initialize the date range picker with the correct date format
            $(".filtered-datepicker").daterangepicker({
                timePicker: false, // Disable time picker
                startDate: moment.unix(window.profile.dateTime.startedAt).format("DD/MM/YYYY"),
                endDate: moment.unix(window.profile.dateTime.endedAt).format("DD/MM/YYYY"),
                locale: {
                    format: "DD/MM/YYYY" // Set the locale format for the date picker
                }
            }, function (b, c) {
                profile.dateTime = { startedAt: b.unix(), endedAt: c.unix() };
                a.draw();
            });

            $("#filteredTable").removeClass("loading");
        },
        
        drawCallback: function () {
             $("#filteredTable tbody").on("click", "tr", function () {
                // Get the JSON data from the clicked row
                const jsonData = $(this).find("[data-json]").data("json");
                
                // Format and display the JSON data in the modal
                $(".modal-body").jsonViewer(jsonData, { collapsed: false });

                // Show the modal
                $("#filteredModal").modal("show");
            });
            
            $("#filteredTable").removeClass("loading");
            $("html").animate({ scrollTop: 0 }, 300);
        }              
    });

    $("#filteredTable select.method, #filteredTable input.filtered-name, #filteredTable input.elapsed").off().on("input", function () {
        $("#filteredTable").addClass("loading");
        a.draw();
    });
};


var getCharts = function () {
    // Fetch and render pie chart
    $.ajax({
        type: "GET",
        async: true,
        url: "api/measurements/methodDistribution/",
        dataType: "json",
        data: {
            startedAt: window.profile.dateTime.startedAt,
            endedAt: window.profile.dateTime.endedAt
        },
        success: function (a) {
            var b = a.distribution, c = [];
            for (key in b) {
                if (b.hasOwnProperty(key)) {
                    c.push({ label: key, value: b[key] });
                }
            }

            var pieLabels = c.map(item => item.label);
            var pieData = c.map(item => item.value);

            var ctxPie = document.getElementById('pieCanvas').getContext('2d');

            // Destroy the previous chart if it exists
            if (window.pieChart) {
                window.pieChart.destroy();
            }

            window.pieChart = new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: pieLabels,
                    datasets: [{
                        data: pieData,
                        backgroundColor: [
                            "#4BB74B",
                            "#0C8DFB",
                            "#FB6464",
                            "#2758E4"
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.raw; // Display the value
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        },
        error: function () {
            console.error("Error fetching pie chart data.");
        }
    });

    // Fetch and render line chart
    $.ajax({
        type: "GET",
        async: true,
        url: "api/measurements/timeseries/",
        dataType: "json",
        data: {
            interval: window.dayFilterValue === "hours" ? "hourly" : "daily",
            startedAt: window.profile.dateTime.startedAt,
            endedAt: window.profile.dateTime.endedAt
        },
        success: function (data) {
            var labels = [];
            var chartData = [];
            var series = data.series;

            for (var key in series) {
                if (series.hasOwnProperty(key)) {
                    // Format based on interval: daily as DD/MM/YYYY, hourly as HH:MM
                    var formattedKey;
                    if (window.dayFilterValue === "hours") {
                        // Format as HH:MM for hourly data
                        formattedKey = moment(key, moment.ISO_8601).isValid() ? moment(key).format("HH:mm") : "Invalid Date";
                    } else {
                        // Format as DD/MM/YYYY for daily data
                        formattedKey = moment(key, moment.ISO_8601).isValid() ? moment(key).format("DD/MM/YYYY") : "Invalid Date";
                    }

                    // If the formatted date is valid, push it to labels
                    if (formattedKey !== "Invalid Date") {
                        labels.push(formattedKey);
                        chartData.push(series[key]);
                    }
                }
            }

            var ctxLine = document.getElementById('lineCanvas').getContext('2d');

            // Destroy the previous chart if it exists
            if (window.lineChart) {
                window.lineChart.destroy();
            }

            window.lineChart = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total Requests',
                        data: chartData,
                        backgroundColor: 'rgba(236, 91, 25, 0.2)',
                        borderColor: '#EC5B19',
                        borderWidth: 1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        error: function () {
            console.error("Error fetching time series data.");
        }
    });
};

$(document).ready(function () {
    // Handle tab switching
    $('a[data-bs-toggle="tab"]').on('click', function (e) {
        e.preventDefault(); // Prevent default anchor behavior
        var target = $(this).attr('href'); // Get the target tab
        console.log(target)
    
        // Hide all tabs and remove active class
        $('.tab-pane').removeClass('active show');
        $('a[data-bs-toggle="tab"]').removeClass('active');
    
        // Show the selected tab and add active class
        $(target).addClass('active show');
        $(this).addClass('active');
    
        // Manage browser history
        const newUrl = $(this).attr('href'); // Get the href for the new tab
        history.pushState(null, '', newUrl); // Update the URL without reloading
    });
    
    // Handle back/forward button navigation
    window.onpopstate = function () {
        const activeTab = window.location.hash || '#tab-dashboard'; // Default to dashboard tab
        $('a[data-bs-toggle="tab"][href="' + activeTab + '"]').trigger('click'); // Trigger click on the correct tab
    };    

    $("#big-users-table").on("preXhr.dt", function (a, b, c) {
        window.profile.dataTableOption = c;
        var d = profile.createQueryParams("grouped", c);
        for (key in d) d.hasOwnProperty(key) && (c[key] = d[key]);
    });

    // Event listener for the delete button
    $("#delete-all-data").on("click", function () {
        // Show a confirmation dialog
        if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
            // Proceed with the delete operation
            $.ajax({
                url: "api/measurements/deleteall", // Adjust this URL as necessary
                success: function () {
                    alert("All data has been successfully deleted.");
                    // Optionally, refresh or update your data tables or charts here
                },
                error: function () {
                    alert("There was an error deleting the data. Please try again.");
                }
            });
        }
    });


    var a = $("#big-users-table").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: "api/measurements/grouped",
            dataSrc: function (a) {
                var b = profile.dataTableClassifier(a.measurements);
                return b.data;
            }
        },
        responsive: true,
        paging: true,
        pageLength: 1e4,
        dom: "Btrtip",
        stateSave: true,
        autoWidth: false,
        order: [2, "desc"],
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
                title: "Method",
                data: function (a) {
                    return '<span class="row--method ' + a.method.toLowerCase() + '">' + a.method + "</span>";
                },
                "class": "method",
                orderable: false
            },
            {
                title: "Route",
                data: function (a) {
                    var b = document.createElement("div");
                    return b.innerText = a.name, b.innerHTML;
                },
                "class": "name",
                orderable: false
            },
            {
                title: "Request Count",
                data: "count",
                "class": "number"
            },
            {
                title: "Average Time Elapsed",
                data: function (a) {
                    return a.avgElapsed.toString().slice(0, 8);
                },
                "class": "number"
            },
            {
                title: "Max Time Elapsed",
                data: function (a) {
                    return a.maxElapsed.toString().slice(0, 8);
                },
                "class": "number"
            },
            {
                title: "Min Time Elapsed",
                data: function (a) {
                    return a.minElapsed.toString().slice(0, 8);
                },
                "class": "number"
            }
        ],
        drawCallback: function () {
            $("#big-users-table tbody tr").off().on("click", function (a) {
                if ("A" !== $(a.target).prop("tagName")) {
                    var b = $(".filtered-datepicker");
                    $("#filteredTable .filter-row .filtered-name")
                        .val($(this).find("td.name").text())
                        .trigger("input");
                    $("#filteredTable .filter-row .method")
                        .val($(this).find(".method .row--method").text())
                        .trigger("input");
                    if ("object" == typeof b.data("daterangepicker")) {
                        b.data("daterangepicker").setStartDate(moment.unix(window.profile.dateTime.startedAt).format("DD/MM/YYYY"));
                        b.data("daterangepicker").setEndDate(moment.unix(window.profile.dateTime.endedAt).format("MM/DD/YYYY"));
                    }
                    setFilteredTable();
        
                    // Instead of using tab('show'), trigger a click on the tab
                    $('a[href="#tab-filtering"]').trigger("click");
                }
            });
        },        
        initComplete: function () { }
    });

    $(document).on("popstate", function (a) {
        console.log(a);
    });

    $('a[href="#tab-filtering"]').on('click', function (e) {
        // Check if the table is already initialized
        if (!$.fn.DataTable.isDataTable("#filteredTable")) {
            // Initialize the filtered table if it's not already initialized
            setFilteredTable();
        }
    });
    
    $(document).on("click", ".day-filter button", function () {
        $("#lineChart, #pieChart").addClass("loading");
    
        // Get the button's id or a custom value
        var d = $(this).attr("id");
    
        // Only proceed if the value has changed
        if (window.dayFilterValue !== d) {
            window.dayFilterValue = d;
    
            // Set date ranges based on the button clicked
            var c = (d === "min") ? 
                { startedAt: moment().subtract(1, "hours").unix(), endedAt: moment().unix() } :
                (d === "hours") ? 
                { startedAt: moment().subtract(24, "hours").unix(), endedAt: moment().unix() } :
                (d === "days") ? 
                { startedAt: moment().subtract(7, "days").unix(), endedAt: moment().unix() } :
                { startedAt: moment().subtract(30, "days").unix(), endedAt: moment().unix() };
    
            // Store dateTime in the profile
            window.profile.dateTime = c;
    
            // Call your chart update functions
            getCharts();
            // Update any filtered tables if necessary
            setFilteredTable();
        }
    });    
    
    getCharts();

    function b() {
        $(".created-time").text("Last Updated " + moment(profile.createdTime).fromNow());
        setTimeout(b, 5e3);
    }

    b();
});

$(document).on("show.bs.tab", '[data-target="#tab-filtering"]', function (a) {
    setFilteredTable();
});
