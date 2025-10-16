document.getElementById('fetchBtn').addEventListener('click', async () => {
    const numUsers = document.getElementById('numUsers').value;
    if (!numUsers || numUsers < 1) {
        alert('Please enter a valid number');
        return;
    }

    try {
        const response = await fetch(`https://l64is2dzni.execute-api.us-east-1.amazonaws.com/prod/users?userId=${numUsers}`);
        const data = await response.json();
        const userList = document.getElementById('userList');
        userList.innerHTML = ''; // Clear previous results

        // If the API returns a single user object
        if (!Array.isArray(data)) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Name:</strong> ${data.name} <br>
                            <strong>Email:</strong> ${data.email} <br>
                            <strong>User ID:</strong> ${data.userId}`;
            userList.appendChild(li);
        } else {
            // If the API returns an array of users
            data.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>Name:</strong> ${user.name} <br>
                                <strong>Email:</strong> ${user.email} <br>
                                <strong>User ID:</strong> ${user.userId}`;
                userList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('userList').innerHTML = '<li>Failed to fetch users.</li>';
    }
});