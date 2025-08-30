// โหลดข้อมูลจาก localStorage เมื่อหน้าเว็บเริ่ม
document.addEventListener('DOMContentLoaded', loadHistory);

function saveAndPrintBill() {
    let room = document.getElementById('room').value;
    let oldMeter = parseFloat(document.getElementById('oldMeter').value);
    let newMeter = parseFloat(document.getElementById('newMeter').value);
    let resultDiv = document.getElementById('result');

    // ตรวจสอบข้อมูล
    if (!room || room === "-- เลือกห้อง --") {
        resultDiv.innerHTML = "กรุณาเลือกห้องน้า!";
        return;
    }
    if (isNaN(oldMeter) || isNaN(newMeter)) {
        resultDiv.innerHTML = "กรุณากรอกมิเตอร์ให้ถูกต้องน้า!";
        return;
    }
    if (newMeter < oldMeter) {
        resultDiv.innerHTML = "มิเตอร์ใหม่ต้องมากกว่าหรือเท่ากับมิเตอร์เก่าน้า!";
        return;
    }

    let units = newMeter - oldMeter;
    let bill = units * 7;

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
            <title>ใบแจ้งหนี้</title>
            <style>
                body { font-family: Arial; text-align: center; }
                h2 { color: navy; }
                p { font-size: 16px; }
                button { padding: 10px 20px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h2>ค่าไฟ เดือน${month} ${year}</h2>
            <p>ห้อง: ${room}</p>
            <p>เลขมิเตอร์เก่า: ${oldMeter}</p>
            <p>เลขมิเตอร์ใหม่: ${newMeter}</p>
            <p>จำนวนหน่วยที่ใช้: ${units}</p>
            <p>ค่าไฟ: ${bill} บาท</p>
            <button onclick="window.print()">พิมพ์</button>
        </body>
        </html>
    `);
    printWindow.document.close();

    // ล้างฟอร์มหลังบันทึก
    document.getElementById('room').value = '';
    document.getElementById('oldMeter').value = '';
    document.getElementById('newMeter').value = '';
    resultDiv.innerHTML = "บันทึกและพิมพ์เรียบร้อยน้า!";
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
            const roomA = parseInt(a.room.replace('ห้อง ', ''));
            const roomB = parseInt(b.room.replace('ห้อง ', ''));
            return roomA - roomB;
        } else if (sortBy === 'month') {
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        } else if (sortBy === 'bill') {
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
    if (confirm("แน่ใจนะคะว่าอยากลบประวัติทั้งหมด? ข้อมูลจะหายหมดเลยน้า!")) {
        // ลบข้อมูลใน localStorage
        localStorage.removeItem('meterHistory');
        // อัปเดตตาราง
        loadHistory();
        // แจ้งเตือน
        document.getElementById('result').innerHTML = "ลบประวัติทั้งหมดเรียบร้อยน้า!";
    }
}