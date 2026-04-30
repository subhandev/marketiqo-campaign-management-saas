export async function getCampaigns() {
  const res = await fetch("/api/campaigns");

  if (!res.ok) {
    throw new Error("Failed to fetch campaigns");
  }

  return res.json();
}

export async function createCampaign(data: { name: string; platform: string }) {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create campaign");
  }

  return res.json();
}
