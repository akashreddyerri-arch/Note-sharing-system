import { useState } from 'react'
import { ArrowRight, BookOpen, Eye, EyeOff, Sparkles } from 'lucide-react'
import { login, register } from '../services/auth'
import './AuthScreen.css'

function AuthScreen({ onAuthenticated, message = '' }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isRegister = mode === 'register'

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const user = isRegister
        ? await register({ name, email, password })
        : await login({ email, password })
      onAuthenticated(user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="About Notehaven">
        <a className="auth-brand" href="#home">
          <span className="auth-brand-mark"><BookOpen size={22} /></span>
          <span>note<span>haven</span></span>
        </a>
        <div className="story-content">
          <span className="story-kicker"><Sparkles size={14} /> A COMMUNITY OF CURIOUS MINDS</span>
          <h1>Learning is better<br />when we <em>share it.</em></h1>
          <p>Find thoughtful notes from fellow students, or share what helped you understand the hard bits.</p>
          <div className="story-open-book" aria-hidden="true">
            <div className="book-page book-page-left">
              <span className="book-page-label">FIELD NOTES · 01</span>
              <strong>Ideas worth<br />keeping.</strong>
              <span className="book-rule book-rule-short" />
              <span className="book-rule" />
              <span className="book-rule book-rule-medium" />
            </div>
            <div className="book-page book-page-right">
              <span className="book-page-label">A SHARED THOUGHT</span>
              <span className="book-rule" />
              <span className="book-rule book-rule-medium" />
              <span className="book-rule" />
              <span className="book-rule book-rule-short" />
              <i>✦</i>
            </div>
            <span className="book-fold" />
          </div>
          <div className="story-note">
            <div className="story-note-icon"><BookOpen size={18} /></div>
            <div><strong>A little knowledge goes a long way.</strong><span>Your next study breakthrough might be one note away.</span></div>
            <span className="story-spark"><Sparkles size={19} /></span>
          </div>
        </div>
        <div className="story-footer"><span>Notehaven</span><span>Made for curious minds.</span></div>
        <span className="story-decoration story-decoration-one" />
        <span className="story-decoration story-decoration-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">{isRegister ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</span>
          <h2>{isRegister ? 'Create your student account' : 'Sign in to your library'}</h2>
          <p className="auth-intro">{isRegister ? 'One account, a whole community of shared learning.' : 'Your notes and your community are waiting.'}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'selected' : ''} onClick={() => changeMode('login')}>Sign in</button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'selected' : ''} onClick={() => changeMode('register')}>Create account</button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {isRegister && (
              <label>
                Your name
                <input autoComplete="name" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we address you?" maxLength="80" required />
              </label>
            )}
            <label>
              Student email
              <input autoComplete="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.edu" maxLength="254" required />
            </label>
            <label>
              Password
              <span className="password-input">
                <input autoComplete={isRegister ? 'new-password' : 'current-password'} name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? 'At least 10 characters' : 'Enter your password'} minLength={isRegister ? 10 : undefined} maxLength="128" required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </span>
            </label>
            {(error || message) && <p className="auth-error" role="alert">{error || message}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : isRegister ? 'Create my account' : 'Sign in'}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to Notehaven?'}
            <button type="button" onClick={() => changeMode(isRegister ? 'login' : 'register')}>{isRegister ? 'Sign in' : 'Create an account'}</button>
          </p>
          <p className="auth-privacy">Your account is for the student community. Your password is securely hashed and never stored as plain text.</p>
        </div>
      </section>
    </main>
  )
}

export default AuthScreen
