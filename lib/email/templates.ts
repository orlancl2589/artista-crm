// Plantillas HTML para emails transaccionales de Artista CRM

const base = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
    .header { padding: 24px 28px 20px; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 12px; }
    .logo { width: 38px; height: 38px; background: #c8ff00; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .logo-text { color: #fff; font-size: 15px; font-weight: 800; line-height: 1; }
    .logo-sub { color: #666; font-size: 11px; font-family: monospace; }
    .body { padding: 28px; }
    .label { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 3px 8px; border-radius: 20px; margin-bottom: 14px; }
    h1 { color: #fff; font-size: 22px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.5px; }
    p { color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .highlight { color: #c8ff00; font-weight: 700; }
    .info-box { background: #1a1a1a; border: 1px solid #222; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
    .info-label { color: #666; font-size: 12px; }
    .info-value { color: #fff; font-size: 13px; font-weight: 600; }
    .cta { display: inline-block; background: #c8ff00; color: #0a0a0a; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 4px; }
    .footer { padding: 20px 28px; border-top: 1px solid #222; text-align: center; }
    .footer p { color: #444; font-size: 11px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <div class="logo">🎵</div>
        <div>
          <div class="logo-text">Artista CRM</div>
          <div class="logo-sub">Notificación automática</div>
        </div>
      </div>
      ${content}
      <div class="footer">
        <p>Artista CRM · Este email fue generado automáticamente · No respondas a este correo</p>
      </div>
    </div>
  </div>
</body>
</html>
`

interface QuoteInfo {
  quoteNumber: string
  clientName: string | null
  total: string
  currency: string
  appUrl: string
  quoteId: string
}

export function quoteSentTemplate({ quoteNumber, clientName, total, currency, appUrl, quoteId }: QuoteInfo) {
  const href = `${appUrl}/quotes/${quoteId}`
  return base(`
    <div class="body">
      <span class="label" style="background:rgba(96,165,250,0.15);color:#60a5fa;">Cotización enviada</span>
      <h1>Cotización marcada como enviada</h1>
      <p>
        Registraste que la cotización <span class="highlight">${quoteNumber}</span>
        ${clientName ? ` para <span class="highlight">${clientName}</span>` : ''} fue enviada al cliente.
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Número</span>
          <span class="info-value">${quoteNumber}</span>
        </div>
        ${clientName ? `<div class="info-row"><span class="info-label">Cliente</span><span class="info-value">${clientName}</span></div>` : ''}
        <div class="info-row">
          <span class="info-label">Total</span>
          <span class="info-value" style="color:#c8ff00;">${formatAmt(total, currency)}</span>
        </div>
      </div>
      <p style="margin-bottom:20px;">Dale seguimiento desde tu CRM. Si el cliente acepta, podrás convertirla directamente en un evento.</p>
      <a href="${href}" class="cta">Ver cotización →</a>
    </div>
  `)
}

export function quoteAcceptedTemplate({ quoteNumber, clientName, total, currency, appUrl, quoteId }: QuoteInfo) {
  const href = `${appUrl}/quotes/${quoteId}`
  return base(`
    <div class="body">
      <span class="label" style="background:rgba(34,197,94,0.15);color:#22c55e;">¡Aceptada!</span>
      <h1>🎉 ¡Tu cotización fue aceptada!</h1>
      <p>
        ${clientName ? `<span class="highlight">${clientName}</span> aceptó` : 'Se aceptó'} la cotización <span class="highlight">${quoteNumber}</span>.
        Es momento de confirmar el evento y seguir adelante.
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Número</span>
          <span class="info-value">${quoteNumber}</span>
        </div>
        ${clientName ? `<div class="info-row"><span class="info-label">Cliente</span><span class="info-value">${clientName}</span></div>` : ''}
        <div class="info-row">
          <span class="info-label">Total pactado</span>
          <span class="info-value" style="color:#22c55e;">${formatAmt(total, currency)}</span>
        </div>
      </div>
      <p style="margin-bottom:20px;">Entra al CRM y convierte esta cotización en un evento para llevar el seguimiento completo.</p>
      <a href="${href}" class="cta">Ver cotización →</a>
    </div>
  `)
}

export function quoteRejectedTemplate({ quoteNumber, clientName, total, currency, appUrl, quoteId }: QuoteInfo) {
  const href = `${appUrl}/quotes/${quoteId}`
  return base(`
    <div class="body">
      <span class="label" style="background:rgba(239,68,68,0.15);color:#ef4444;">Rechazada</span>
      <h1>La cotización fue rechazada</h1>
      <p>
        La cotización <span class="highlight">${quoteNumber}</span>
        ${clientName ? ` de <span class="highlight">${clientName}</span>` : ''} fue marcada como rechazada.
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Número</span>
          <span class="info-value">${quoteNumber}</span>
        </div>
        ${clientName ? `<div class="info-row"><span class="info-label">Cliente</span><span class="info-value">${clientName}</span></div>` : ''}
        <div class="info-row">
          <span class="info-label">Total</span>
          <span class="info-value">${formatAmt(total, currency)}</span>
        </div>
      </div>
      <p style="margin-bottom:20px;">Puedes reabrirla como borrador para ajustarla y volver a enviarla.</p>
      <a href="${href}" class="cta">Ver cotización →</a>
    </div>
  `)
}

function formatAmt(total: string, currency: string) {
  const n = Number(total)
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)
}