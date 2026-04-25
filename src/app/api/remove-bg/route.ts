export async function POST(req: Request) {
  const { imageBase64 } = await req.json()

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY as string,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image_file_b64: imageBase64,
        size: "auto",
        type: "product",
        type_level: "2",
        format: "png",
        crop: "false",
        scale: "original",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("REMOVE.BG ERROR:", error)
      return Response.json({ error }, { status: 500 })
    }

    const buffer = await response.arrayBuffer()
    return new Response(buffer, {
      headers: { "Content-Type": "image/png" },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}