function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function opennForm() {
    document.getElementById("ips").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}

function myStop() {
    clearInterval(myInterval);
}

function storeIpAddress() {
    const ipAddress = document.getElementById('ipAddressInput').value;

    if (!ipAddress) {
        alert('Please enter an IP address');
        return;
    }

    fetch('http://127.0.0.1:9000/save-ip', {
        method: ('POST'),
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ipAddress })
    })
        .then(response => {

            console.log(response)

            if (response.ok) {
                alert(`IP address ${ipAddress} stored successfully!`);
            } else {
                alert('Failed to save IP address');
                return;
            }
        });

}

const ipListElement = document.getElementById('ipList');

async function fetchIPStatus() {
    try {
        const response = await fetch('http://127.0.0.1:9000/update-status/ips');
        const data = await response.json();
        renderIPStatus(data);

    }
    catch (error) {
        console.error('Error fetching IP status:', error);
    }
}

function renderIPStatus(data) {
    const tbody = document.querySelector('#ipList tbody');
    tbody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        const ipCell = document.createElement('td');
        const statusCell = document.createElement('td');

        ipCell.textContent = item.ip;
        statusCell.textContent = item.status;

        row.appendChild(ipCell);
        row.appendChild(statusCell);
        tbody.appendChild(row);
    });
}

 const myInterval = setInterval(fetchIPStatus, 100);
 

 async function stopInterval() {
    try {
        const response = await fetch('http://127.0.0.1:9000/stop-update');
        if (response.ok) {
            clearInterval(myInterval);
            alert('Interval stopped successfully');
        } else {
            alert('Failed to stop the interval');
        }
    } catch (error) {
        console.error('Error stopping interval:', error);
    }
}
