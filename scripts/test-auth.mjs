async function testRegister() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        role: "job_seeker"
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("Registration successful:", data);
    } else {
      console.error("Registration failed:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testRegister();
