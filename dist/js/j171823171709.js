let schedule = [
    {start: 10.5, end: 12, name: '做饭🍚'},
    {start: 12, end: 14, name: '出去玩🏞️'},
    {start: 14, end: 15, name: '玩手机📱'},
    {start: 15, end: 16.5, name: '健身💪'},
    {start: 16.5, end: 18, name: '做饭🍚'},
    {start: 18, end: 20, name: '学习📚'},
    {start: 20, end: 23, name: '创作💰'},
    {start: 23, end: 23.5, name: '洗澡🚿'},
    {start: 23.5, end: 10.5 + 24, name: '睡觉🛏️'}
];

let showCurrent = true;

function toggleCurrentTime() {
    showCurrent = !showCurrent;
    let toggleCurrentText = document.getElementById("toggleCurrentText");
    let currentTimeElement = document.getElementById("currentTime"); // Get the currentTime element

    if (showCurrent) {
        toggleCurrentText.textContent = "关闭当前时间";
        toggleCurrentText.classList.remove("green-text");
        currentTimeElement.style.visibility = "visible";
    } else {
        toggleCurrentText.textContent = "显示当前时间";
        toggleCurrentText.classList.add("green-text");
        currentTimeElement.style.visibility = "hidden";
    }
    draw(schedule);
}

function timeStringToFloat(timeString) {
    const parts = timeString.toString().split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    let r = hours + minutes / 60;
    return r;
}

function floatToTimeString(floatTime) {
    floatTime = floatTime % 24;
    const hours = Math.floor(floatTime);
    const minutes = Math.round((floatTime - hours) * 60);
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}

function draw(schedule) {
    //console.log(schedule)
    d3.select("#clock").selectAll("*").remove();
    const width = 700;
    const height = 700;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const hours = 24;

    const svg = d3.select("#clock")
        .attr("width", width)
        .attr("height", height);

    const clockScale = d3.scaleLinear()
        .domain([0, hours])
        .range([0, 2 * Math.PI]);

    const clockTicks = d3.range(0, hours * 2).map(d => {
        const angle = clockScale(d / 2) - Math.PI / 2;
        const isHalfHour = d % 2 !== 0;
        const tickLength = isHalfHour ? 10 : 0;
        const x1 = centerX + Math.cos(angle) * (radius - tickLength);
        const y1 = centerY + Math.sin(angle) * (radius - tickLength);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        return {x1, y1, x2, y2, hour: d / 2, isHalfHour};
    });

    svg.selectAll(".clock-tick")
        .data(clockTicks)
        .enter().append("line")
        .attr("class", d => d.isHalfHour ? "half-hour-tick" : "hour-tick")
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke", "gray");

    svg.selectAll(".clock-label")
        .data(clockTicks.filter(d => !d.isHalfHour))
        .enter().append("text")
        .attr("class", "clock-label")
        .attr("x", d => centerX + Math.cos(clockScale(d.hour) - Math.PI / 2) * (radius - 10))
        .attr("y", d => centerY + Math.sin(clockScale(d.hour) - Math.PI / 2) * (radius - 10))
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .text(d => d.hour);

    const hourPoints = d3.range(0, hours).map(d => {
        const angle = clockScale(d) - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius - 30); // 调整半径以控制黑点的位置
        const y = centerY + Math.sin(angle) * (radius - 30);
        return {x, y};
    });

    svg.selectAll(".hour-point")
        .data(hourPoints)
        .enter().append("circle")
        .attr("class", "hour-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .attr("fill", "black");

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 30)
        .startAngle(d => clockScale(d.start))
        .endAngle(d => clockScale(d.end));

    svg.selectAll(".schedule-arc")
        .data(schedule)
        .enter().append("path")
        .attr("class", "schedule-arc")
        .attr("d", arcGenerator)
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

    svg.selectAll(".schedule-label")
        .data(schedule)
        .enter().append("text")
        .attr("class", "schedule-label")
        .attr("transform", d => {
            const startAngle = clockScale(d.start) - Math.PI / 2;
            const endAngle = clockScale(d.end) - Math.PI / 2;
            const labelRadius = (radius - 50) / 1.1;
            const labelAngle = (startAngle + endAngle) / 2;
            const x = centerX + Math.cos(labelAngle) * labelRadius;
            const y = centerY + Math.sin(labelAngle) * labelRadius;
            return `translate(${x},${y})`;
        })
        .attr("text-anchor", "middle")
        .style("font-size", "1rem")
        .text(d => d.name);


    function updateCurrentTime() {
        //console.log("updateCurrentTime")
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        if (showCurrent) {
            svg.selectAll(".current-time-dot").remove();
            const currentTimeDot = svg.append("circle")
                .attr("class", "current-time-dot")
                .attr("r", 5)
                .attr("fill", "red");

            const totalMinutes = hours * 60 + minutes + seconds / 60;
            const currentAngle = clockScale(totalMinutes / 60) - Math.PI / 2;
            const x = centerX + Math.cos(currentAngle) * (radius - 30);
            const y = centerY + Math.sin(currentAngle) * (radius - 30);
            svg.selectAll(".schedule-arc")
                .attr("fill", function (d) {
                    if ((totalMinutes >= d.start * 60 && totalMinutes < d.end * 60) ||
                        (totalMinutes + 1440 >= d.start * 60 && totalMinutes + 1440 < d.end * 60)
                    ) {
                        return "rgba(44, 160, 44, 0.3)";
                    } else {
                        return "rgb(255,255,255,0.5)";
                    }
                });
            currentTimeDot.attr("cx", x).attr("cy", y);

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const formattedDateTime = `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.getElementById("currentTime").textContent = formattedDateTime;

        }

    }

    if (showCurrent) {
        setInterval(updateCurrentTime, 1000);
        updateCurrentTime();
    }
}

function calculateTotalDuration() {
    //console.log(schedule)
    let totalDuration = 0;
    schedule.forEach(item => {
        //console.log("item.end=="+item.end)
        //console.log("item.start=="+item.start)
        totalDuration += item.end - item.start;
        //console.log(totalDuration)
    });
    //console.log(totalDuration)
    return totalDuration.toFixed(2);
}

function generateTimeOptions(selectedTime) {
    let options = '';
    for (let hours = 0; hours < 24; hours++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
            const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            options += `<option value="${time}" ${selectedTime === time ? 'selected' : ''}>${time}</option>`;
        }
    }
    return options;
}

function renderSchedule() {
    //console.log("render")
    handleOverlapping();
    const scheduleTable = $("#scheduleTable");
    scheduleTable.empty();
    schedule.forEach((item, index) => {
        const rowNumber = index + 1;
        const duration = floatToTimeString(item.end - item.start);
        const row = `
                    <tr ${item.isOverlap ? 'class="table-danger"' : ''}>
                        <td>${rowNumber}</td>
                        <td>
                            <div class="input-group">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'start', -30)">‹</button>
                                </div>
                                    <select class="form-control" onchange="updateSchedule(${index}, 'start', this.value)">
                                        ${generateTimeOptions(floatToTimeString(schedule[index].start))}
                                    </select>                                
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'start', 30)">›</button>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="input-group">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'end', -30)">‹</button>
                                </div>                            
                                    <select class="form-control" onchange="updateSchedule(${index}, 'end', this.value)">
                                        ${generateTimeOptions(floatToTimeString(schedule[index].end))}
                                    </select>                                
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'end', 30)">›</button>
                                </div>
                            </div>
                        </td>
                        <td>${duration}</td>
                        <td>
                            <div class="input-group">
                                 <input type="text" class="form-control" value="${item.name}" onchange="updateSchedule(${index}, 'name', this.value)" oninput="onInputChange(${index})">
                                 <div class="input-group-append">
                                    <button id="editButton-${index}" class="btn btn-sm btn-outline-secondary hide-button" onclick="renderSchedule()">✓</button>
                                 </div>
                            </div>
                        </td>
                        <td>
                        <div class="input-group d-flex justify-content-center">
                            <div class="input-group-append">
                                <button class="btn btn-sm btn-outline-secondary" onclick="deleteRow(${index})">×</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="moveRowUp(${index})">↑</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="moveRowDown(${index})">↓</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="addRow(${index + 1})">+</button>
                            </div>
                        </div>
                        </td>
                    </tr>
                `;
        scheduleTable.append(row);
    });
    const totalDuration = calculateTotalDuration();
    $("#totalDuration").css("color", totalDuration > 24 ? "red" : totalDuration == 24 ? "green" : "");
    $("#totalDuration").text(`时长(${totalDuration}h)`);
    draw(schedule);
    updateScheduleText();
}


function moveRowUp(index) {
    if (index > 0) {
        const temp = schedule[index];
        schedule[index] = schedule[index - 1];
        schedule[index - 1] = temp;
        renderSchedule();
    }
}

function moveRowDown(index) {
    if (index < schedule.length - 1) {
        const temp = schedule[index];
        schedule[index] = schedule[index + 1];
        schedule[index + 1] = temp;
        renderSchedule();
    }
}


function handleOverlapping() {
    //console.log(schedule)
    const overlappingRows = [];
    for (let index = 0; index < schedule.length; index++) {
        schedule.forEach((item, i) => {
            if (i !== index) {
                let start = schedule[index].start;
                let end = schedule[index].end;
                if (start == end) {
                } else if (
                    (start < item.end && end > item.start) ||
                    (start + 24 < item.end && end + 24 > item.start) ||
                    (start - 24 < item.end && end - 24 > item.start)
                ) {
                    overlappingRows.push(i);
                    if (!overlappingRows.includes(index)) {
                        overlappingRows.push(index);
                    }
                }
            }
        });
        overlappingRows.forEach((rowIndex) => {
            schedule[rowIndex].isOverlap = true;
        });
        schedule.forEach((item, i) => {
            if (!overlappingRows.includes(i)) {
                schedule[i].isOverlap = false;
            }
        });
    }
    //console.log(schedule)
}

function handleAndRender(index) {
    if (schedule[index].start > schedule[index].end) {
        schedule[index].end += 24;
    }
    if (schedule[index].end - schedule[index].start >= 24) {
        schedule[index].end = schedule[index].end % 24;
        schedule[index].start = schedule[index].start % 24;
    }
    renderSchedule();
}

function updateSchedule(index, field, value) {
    if (field === 'start' || field === 'end') {
        let newTime = timeStringToFloat(value);
        schedule[index][field] = newTime;
        handleAndRender(index);
    } else if (field === 'name') {
        schedule[index][field] = value.toString().trim();
        renderSchedule();
    }
    const editButton = document.querySelector(`#editButton-${index}`);
    editButton.classList.add("hide-button");
}

function adjustTime(index, field, minutes) {
    const timeInput = field === 'start' ? schedule[index].start : schedule[index].end;
    let adjustedTime = timeInput + minutes / 60;
    if (adjustedTime < 0) {
        adjustedTime += 24;
    }
    if (field === 'start') {
        schedule[index].start = adjustedTime;
    } else {
        schedule[index].end = adjustedTime;
    }
    handleAndRender(index);
}

function deleteRow(index) {
    if (schedule.length == 1) {
        return;
    }
    schedule.splice(index, 1);
    renderSchedule();
}

function addRow(index) {
    if (schedule.length < 20) {
        schedule.splice(index, 0, {start: 0, end: 0, name: ''});
        renderSchedule();
    } else {
        alert("最多20行~");
    }
    //console.log(schedule)
}

function onInputChange(index) {
    const editButton = document.querySelector(`#editButton-${index}`);
    editButton.classList.remove("hide-button");
}

function parseScheduleText() {
    const text = document.getElementById("scheduleText").value.trim();
    if (text.length == 0) {
        alert("empty!");
    } else {
        const lines = text.split('\n');
        if (lines.length > 20) {
            alert("最多20行~");
        }
        for (const line of lines) {
            const cleanedText = line.replace(/\s/g, "").trim();
            if (cleanedText.length > 0) {
                const pattern = /^(0[0-9]|1[0-9]|2[0-3]):(00|30)#(0[0-9]|1[0-9]|2[0-3]):(00|30)#[\s\S]*$/;
                if (!pattern.test(cleanedText)) {
                    alert("格式错误：" + cleanedText + "\n" + "(00~23)时:(00/30)分#(00~23)时:(00/30)分#日程");
                    return;
                }
            }
        }
        schedule = [];
        for (const line of lines) {
            const cleanedText = line.replace(/\s/g, "").trim();
            if (cleanedText.length > 0) {
                const parts = cleanedText.split('#');
                if (parts.length === 3) {
                    //console.log("parts==" + parts)
                    let start = timeStringToFloat(parts[0]);
                    let end = timeStringToFloat(parts[1]);
                    if (start > end) {
                        end += 24;
                    }
                    //console.log("startTime==" + start+",endTime==" + end)
                    const name = parts[2].trim();
                    schedule.push({start, end, name});
                }
            }
        }
    }
    renderSchedule();
    updateScheduleText();
    new bootstrap.Toast(document.getElementById('parseToast')).show();
}

function updateTextareaRows() {
    let scheduleTextElement = document.getElementById("scheduleText");
    const text = scheduleTextElement.value.trim();
    let number = Math.max(text.split('\n').length + 1, 5);
    //console.log(number);
    scheduleTextElement.rows = number;
    if (text.length > 0) {
        document.getElementById("copyButton").style.visibility = "visible";
        document.getElementById("parseButton").style.visibility = "visible";
    } else {
        document.getElementById("copyButton").style.visibility = "hidden";
        document.getElementById("parseButton").style.visibility = "hidden";
    }
}

function updateScheduleText() {
    const text = schedule.map(item => {
        const start = floatToTimeString(item.start);
        const end = floatToTimeString(item.end);
        return `${start}#${end}#${item.name}`;
    }).join('\n');
    document.getElementById("scheduleText").value = text;
    updateTextareaRows();
}

function copyToClipboard() {
    let textarea = document.getElementById("scheduleText");
    textarea.select();
    document.execCommand("copy");
    textarea.select();
    document.execCommand("copy");
    document.getElementById("copyButton").focus();
    new bootstrap.Toast(document.getElementById('copyToast')).show();
}

function clearScheduleText() {
    document.getElementById("scheduleText").value = "";
    new bootstrap.Toast(document.getElementById('clearToast')).show();
    updateTextareaRows();

    schedule.splice(1);
    renderSchedule();
    updateScheduleText();
}
