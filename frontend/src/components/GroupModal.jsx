import { useState } from 'react'
import { ArrowRight, Users, X } from 'lucide-react'

function GroupModal({ onClose, onSave, saving }) {
  const [mode, setMode] = useState('create')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await onSave(mode, mode === 'create'
        ? { name: name.trim(), description: description.trim() }
        : { inviteCode: inviteCode.trim().toUpperCase() })
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal group-modal" role="dialog" aria-modal="true" aria-labelledby="group-modal-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">LEARN BETTER, TOGETHER</span>
            <h2 id="group-modal-title">{mode === 'create' ? 'Start a study group' : 'Join a study group'}</h2>
            <p>{mode === 'create' ? 'Create a shared space for your classmates.' : 'Enter an invite code from a group member.'}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
        </div>
        <div className="auth-tabs group-tabs" role="tablist" aria-label="Study group options">
          <button type="button" role="tab" aria-selected={mode === 'create'} className={mode === 'create' ? 'selected' : ''} onClick={() => switchMode('create')}>Create group</button>
          <button type="button" role="tab" aria-selected={mode === 'join'} className={mode === 'join' ? 'selected' : ''} onClick={() => switchMode('join')}>Join with code</button>
        </div>
        <form className="note-form group-form" onSubmit={submit}>
          {mode === 'create' ? (
            <>
              <label>
                Group name
                <input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Biology 2026" maxLength="60" required />
              </label>
              <label>
                What are you studying? <span className="optional-label">Optional</span>
                <textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a short group description" rows="3" maxLength="240" />
              </label>
            </>
          ) : (
            <label>
              Group invite code
              <input name="inviteCode" autoComplete="off" value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} placeholder="16-character code" maxLength="16" minLength="16" required />
              <small className="group-help"><Users size={14} /> Ask a member to share their group’s invite code.</small>
            </label>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Please wait…' : mode === 'create' ? 'Create group' : 'Join group'}
              {!saving && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default GroupModal
