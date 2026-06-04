const statusDetails = document.getElementById('status-details')
const statusState = document.getElementById('status-state')
const statusIp = document.getElementById('status-ip')
const statusLocation = document.getElementById('status-location')
const statusRelay = document.getElementById('status-relay')
const refreshButton = document.getElementById('refresh-status')
const vpnPill = document.getElementById('vpn-pill')
const vpnLabel = document.getElementById('vpn-label')
const urlInput = document.getElementById('url')
const browseForm = document.getElementById('browse-form')
const btnLabel = browseForm?.querySelector('.btn-label')

function setVpnState(state, label) {
  vpnPill.classList.remove('is-loading', 'is-ok', 'is-error')
  if (state) vpnPill.classList.add(state)
  vpnLabel.textContent = label
}

function setStatusState(state) {
  statusDetails.classList.remove('is-loading', 'is-ok', 'is-error')
  if (state) statusDetails.classList.add(state)
}

function formatLocation(mullvad) {
  const parts = [mullvad.city, mullvad.country].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

function resetStatusFields() {
  statusState.textContent = 'Checking…'
  statusIp.textContent = '—'
  statusLocation.textContent = '—'
  statusRelay.textContent = '—'
}

async function loadStatus() {
  setStatusState('is-loading')
  setVpnState('is-loading', 'Checking connection…')
  resetStatusFields()

  try {
    const res = await fetch('/api/status')
    const data = await res.json()

    if (data.ok && data.mullvad) {
      const { mullvad } = data
      statusState.textContent = 'Connected'
      statusIp.textContent = mullvad.ip || '—'
      statusLocation.textContent = formatLocation(mullvad)
      statusRelay.textContent = data.socks || '—'
      setStatusState('is-ok')
      setVpnState('is-ok', mullvad.ip ? `Connected · ${mullvad.ip}` : 'Connected')
      return
    }

    statusState.textContent = 'Disconnected'
    statusIp.textContent = '—'
    statusLocation.textContent = '—'
    statusRelay.textContent = data.socks || '—'
    setStatusState('is-error')
    setVpnState('is-error', data.error || 'VPN unavailable')
  } catch (err) {
    statusState.textContent = 'Error'
    setStatusState('is-error')
    setVpnState('is-error', 'Unable to reach server')
  }
}

document.querySelectorAll('.quick-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.url
    if (!target) return
    urlInput.value = target
    urlInput.focus()
  })
})

refreshButton.addEventListener('click', loadStatus)

browseForm.addEventListener('submit', () => {
  if (btnLabel) btnLabel.textContent = 'Opening…'
})

loadStatus()
