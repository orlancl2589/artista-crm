export class ApiError extends Error {
  constructor(
    public override message: string,
    public status: number = 500
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): Response {
  if (!(error instanceof ApiError) || error.status >= 500) {
    console.error('[API Error]', error)
  }

  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }

  return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
}
