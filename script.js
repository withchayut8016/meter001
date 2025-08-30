// โหลดข้อมูลจาก localStorage เมื่อหน้าเว็บเริ่ม
document.addEventListener('DOMContentLoaded', loadHistory);

function saveAndPrintBill() {
    let room = document.getElementById('room').value;
    let oldMeter = parseFloat(document.getElementById('oldMeter').value);
    let newMeter = parseFloat(document.getElementById('newMeter').value);
    let old = parseFloat(document.getElementById('old').value);
    let resultDiv = document.getElementById('result');

    // ตรวจสอบข้อมูล
    if (!room || room === "-- เลือกห้อง --") {
        resultDiv.innerHTML = "กรุณาเลือกห้องค่า!";
        return;
    }
    if (isNaN(oldMeter) || isNaN(newMeter)) {
        resultDiv.innerHTML = "กรุณากรอกมิเตอร์ให้ถูกต้องค่า!";
        return;
    }
    if (newMeter < oldMeter) {
        resultDiv.innerHTML = "มิเตอร์ใหม่ต้องมากกว่าหรือเท่ากับมิเตอร์เก่าค่า!";
        return;
    }

    let units = newMeter - oldMeter;
    let bill = units * 7;
    let total = old + bill;

    // สร้างวันที่และเดือนปัจจุบัน
    let today = new Date();
    let monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
                      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    let month = monthNames[today.getMonth()];
    let year = today.getFullYear() + 543; // แปลงเป็นพ.ศ.

    // บันทึกข้อมูลลง localStorage
    let record = {
        month: month,
        year: year,
        room: room,
        oldMeter: oldMeter,
        newMeter: newMeter,
        units: units,
        bill: bill
    };
    let history = JSON.parse(localStorage.getItem('meterHistory')) || [];
    history.push(record);
    localStorage.setItem('meterHistory', JSON.stringify(history));

    // อัปเดตตารางประวัติ
    loadHistory();

    // สร้างหน้า print
    let printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>ใบค่าไฟ</title>
            <style>
                body { font-family: Arial; text-align: center; }
                button { padding: 10px 20px; margin-top: 20px; }
                h2 { font-size: 16px; color: black;}
                p { font-size: 16px; color: black;}
            </style>
        </head>
        <body>
            <h2>ค่าไฟ เดือน${month} ${year}</h2>
            <p>${room}</p>
            <p>เลขมิเตอร์เก่า: ${oldMeter}</p>
            <p>เลขมิเตอร์ใหม่: ${newMeter}</p>
            <p>จำนวนหน่วยที่ใช้: ${units}</p>
            <p>ค่าไฟ (หน่วย x 7): ${bill} บาท</p>
            <p>ค้างชำระ: ${old} บาท</p>
            <p>รวมทั้งสิ้น: ${total} บาท</p>
            <button onclick="window.print()">พิมพ์</button>
        </body>
        </html>
    `);
    printWindow.document.close();

    // ล้างฟอร์มหลังบันทึก
    document.getElementById('room').value = '';
    document.getElementById('oldMeter').value = '';
    document.getElementById('newMeter').value = '';
    resultDiv.innerHTML = "บันทึกและพิมพ์เรียบร้อยค่า!";
}

// ฟังก์ชันโหลดและแสดงประวัติ
function loadHistory() {
    let historyBody = document.getElementById('historyBody');
    let sortBy = document.getElementById('sortBy').value;
    let history = JSON.parse(localStorage.getItem('meterHistory')) || [];

    // กำหนดลำดับเดือนสำหรับการเรียง
    const monthOrder = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
                        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    // เรียงลำดับข้อมูล
    history.sort((a, b) => {
        if (sortBy === 'room') {
            // เรียงตามเลขห้อง
            const roomA = parseInt(a.room.split(' ')[0]);
            const roomB = parseInt(b.room.split(' ')[0]);
            return roomA - roomB;
        } else if (sortBy === 'month') {
            // เรียงตามปีก่อน
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            // ถ้าปีเท่ากัน เรียงตามเดือน
            if (monthOrder.indexOf(a.month) !== monthOrder.indexOf(b.month)) {
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
            }
            // ถ้าเดือนเท่ากัน เรียงตามเลขห้อง
            const roomA = parseInt(a.room.split(' ')[0]);
            const roomB = parseInt(b.room.split(' ')[0]);
            return roomA - roomB;
        } else if (sortBy === 'bill') {
            // เรียงตามค่าไฟจากมากไปน้อย
            return b.bill - a.bill;
        }
    });

    // ล้างตารางและแสดงข้อมูล
    historyBody.innerHTML = '';
    history.forEach(record => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.month}</td>
            <td>${record.year}</td>
            <td>${record.room}</td>
            <td>${record.oldMeter}</td>
            <td>${record.newMeter}</td>
            <td>${record.units}</td>
            <td>${record.bill}</td>
        `;
        historyBody.appendChild(row);
    });
}
// ฟังก์ชันลบประวัติทั้งหมด
function clearHistory() {
    // ขอการยืนยันจากผู้ใช้
    if (confirm("แน่ใจนะคะว่าอยากลบประวัติทั้งหมด? ข้อมูลจะหายหมดเลยนะคะ!")) {
        // ลบข้อมูลใน localStorage
        localStorage.removeItem('meterHistory');
        // อัปเดตตาราง
        loadHistory();
        // แจ้งเตือน
        document.getElementById('result').innerHTML = "ลบประวัติทั้งหมดเรียบร้อยค่า!";
    }
}
// ฟังก์ชันดึงเลขมิเตอร์ครั้งล่าสุดของห้องที่เลือก
function loadLastMeter() {
    let room = document.getElementById('room').value;
    let oldMeterInput = document.getElementById('oldMeter');
    let newMeterInput = document.getElementById('newMeter');
    let resultDiv = document.getElementById('result');

    // ล้างช่อง input ก่อน
    oldMeterInput.value = '';
    newMeterInput.value = '';

    if (!room || room === "-- เลือกห้อง --") {
        resultDiv.innerHTML = "กรุณาเลือกห้องค่า!";
        return;
    }

    // ดึงประวัติจาก localStorage
    let history = JSON.parse(localStorage.getItem('meterHistory')) || [];
    // กรองเฉพาะบันทึกของห้องที่เลือก
    let roomHistory = history.filter(record => record.room === room);

    if (roomHistory.length === 0) {
        resultDiv.innerHTML = 'ไม่มีประวัติค่า! กรุณากรอกเลขมิเตอร์ใหม่';
        return;
    }

    // หาบันทึกครั้งล่าสุดโดยเรียงตามปีและเดือน
    const monthOrder = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
                        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    let latestRecord = roomHistory.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year; // ปีมากกว่ามาก่อน
        }
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month); // เดือนล่าสุดมาก่อน
    })[0];

    // ใส่ค่า newMeter จากครั้งล่าสุดลงใน oldMeter
    oldMeterInput.value = latestRecord.newMeter;
    newMeterInput.value = ''; // ทิ้งให้ว่างเพื่อให้ผู้ใช้กรอกเลขมิเตอร์ใหม่
    resultDiv.innerHTML = 'ดึงเลขมิเตอร์ครั้งล่าสุดเรียบร้อยค่า!';
}

