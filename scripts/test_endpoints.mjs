import "dotenv/config";

const API_URL = "http://localhost:5173/api"; // Based on earlier logs

async function testEndpoints() {
  console.log("🚀 Starting Health Check & API Testing...");

  const endpoints = [
    { name: "Stats", path: "/dashboard/stats" },
    { name: "Jobs List", path: "/jobs" },
  ];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const res = await fetch(`${API_URL}${endpoint.path}`);
      const duration = Date.now() - start;
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [${endpoint.name}] Status: 200 (${duration}ms)`);
        if (endpoint.name === "Stats") {
          console.log(`   Data Check: Total Jobs = ${data.totalJobs}, Users = ${data.totalUsers}`);
        }
        if (endpoint.name === "Jobs List") {
          console.log(`   Data Check: Found ${data.length} jobs. Sample: ${data[0].title} at ${data[0].company}`);
        }
      } else {
        console.error(`❌ [${endpoint.name}] Status: ${res.status}`);
      }
    } catch (err) {
      console.error(`❌ [${endpoint.name}] Error: ${err.message}. (Is the server running?)`);
    }
  }
}

testEndpoints();
