import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  File,
  FileImage,
  FileText,
  Filter,
  LayoutDashboard,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { createNote, deleteNote, getNotes, updateNote, updateNoteStatus } from './services/notes'
import { getCurrentUser, logout } from './services/auth'
import { createGroup, getGroups, joinGroup } from './services/groups'
import AuthScreen from './components/AuthScreen'
import GroupModal from './components/GroupModal'
import './App.css'

const initialForm = { title: '', subject: '', description: '', status: 'active', groupId: 'community', file: null }

function formatBytes(bytes = 0) {
  if (!bytes) return 'File'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value) {
  if (!value) return 'Recently added'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function NoteModal({ note, groupId, groupName, onClose, onSave, saving }) {
  const [form, setForm] = useState(note
    ? { title: note.title, subject: note.subject, description: note.description || '', status: note.status, groupId: note.groupId || 'community', file: null }
    : { ...initialForm, groupId: groupId || 'community' })
  const [formError, setFormError] = useState('')

  function setField(event) {
    const { name, value, files } = event.target
    setForm((current) => ({ ...current, [name]: files ? files[0] : value }))
    setFormError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.subject.trim()) {
      setFormError('Add a title and subject to continue.')
      return
    }
    if (!note && !form.file) {
      setFormError('Choose a file to share with your note.')
      return
    }
    try {
      await onSave(form)
    } catch (error) {
      setFormError(error.message)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{note ? 'KEEP IT UP TO DATE' : 'GROW YOUR LIBRARY'}</span>
            <h2 id="modal-title">{note ? 'Edit your note' : 'Share a new note'}</h2>
            <p>{note ? 'Make changes to your study material.' : 'Add helpful context so others can find it.'}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
        </div>
        <form className="note-form" onSubmit={submit}>
          <label>
            Note title
            <input name="title" value={form.title} onChange={setField} placeholder="e.g. Introduction to Data Structures" maxLength="120" required />
          </label>
          <label>
            Subject
            <input name="subject" value={form.subject} onChange={setField} placeholder="e.g. Computer Science" maxLength="60" required />
          </label>
          <label>
            Description <span className="optional-label">Optional</span>
            <textarea name="description" value={form.description} onChange={setField} placeholder="What will someone learn from these notes?" rows="3" maxLength="1000" />
          </label>
          <div className="sharing-scope">
            <span>SHARING TO</span>
            <strong><Users size={15} /> {groupName}</strong>
          </div>
          <label className="upload-field">
            <span>{note ? 'Replace attachment' : 'Attach your file'}</span>
            <span className="upload-drop">
              <Upload size={19} />
              <span>
                <strong>{form.file?.name || (note ? note.fileName : 'Choose a file to upload')}</strong>
                <small>PDF, Word, PowerPoint or image · up to 20 MB</small>
              </span>
              <span className="browse-button">Browse</span>
              <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp" onChange={setField} />
            </span>
          </label>
          {note && (
            <label>
              Visibility
              <select name="status" value={form.status} onChange={setField}>
                <option value="active">Shared with everyone</option>
                <option value="inactive">Hidden from the library</option>
              </select>
            </label>
          )}
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
              {saving ? 'Saving…' : note ? 'Save changes' : 'Share note'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function NoteCard({ note, canManage, onEdit, onDelete, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fileIcon = note.mimeType?.startsWith('image/')
    ? <FileImage size={18} />
    : note.mimeType?.includes('pdf')
      ? <FileText size={18} />
      : <File size={18} />
  const extension = note.fileName?.split('.').pop()?.toUpperCase() || 'FILE'
  const fileUrl = note.fileUrl ? `${note.fileUrl}` : '#'

  return (
    <article className={`note-card ${note.status === 'inactive' ? 'note-card-muted' : ''}`}>
      <div className="card-topline">
        <span className="subject-pill">{note.subject}</span>
        {canManage && (
          <div className="card-menu-wrap">
            <button className="icon-button card-menu-trigger" type="button" aria-label={`Actions for ${note.title}`} onClick={() => setMenuOpen((open) => !open)}>
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <div className="card-menu">
                <button type="button" onClick={() => { setMenuOpen(false); onEdit(note) }}>Edit note</button>
                <button type="button" onClick={() => { setMenuOpen(false); onToggleStatus(note) }}>{note.status === 'active' ? 'Hide from library' : 'Share with everyone'}</button>
                <button className="danger-action" type="button" onClick={() => { setMenuOpen(false); onDelete(note) }}>Delete note</button>
              </div>
            )}
          </div>
        )}
      </div>
      <h3>{note.title}</h3>
      <p className="note-description">{note.description || 'A shared resource for curious minds.'}</p>
      <div className="note-meta">
        <span><BookOpen size={14} /> {formatDate(note.uploadedAt)}</span>
        <span className={`status-dot ${note.status}`}><i />{note.status === 'active' ? 'Shared' : 'Hidden'}</span>
      </div>
      <div className="attachment-row">
        <span className={`file-icon file-icon-${extension.toLowerCase()}`}>{fileIcon}</span>
        <span className="file-name">
          <strong title={note.fileName}>{note.fileName}</strong>
          <small>{extension} · {formatBytes(note.fileSize)}</small>
        </span>
        {fileUrl !== '#' && (
          <a className="download-button" href={fileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${note.fileName}`}>
            <ArrowDownToLine size={17} />
          </a>
        )}
      </div>
    </article>
  )
}

function App() {
  const [notes, setNotes] = useState([])
  const [groups, setGroups] = useState([])
  const [user, setUser] = useState(null)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [groupSaving, setGroupSaving] = useState(false)
  const [modalNote, setModalNote] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [copiedGroupId, setCopiedGroupId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser) })
      .catch((authError) => { if (active) setError(authError.message) })
      .finally(() => { if (active) setAuthLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!user) {
      setGroups([])
      setSelectedGroupId(null)
      return undefined
    }

    let active = true
    getGroups()
      .then((items) => {
        if (!active) return
        setGroups(items)
        setSelectedGroupId((current) => current && !items.some((group) => group.id === current) ? null : current)
      })
      .catch((groupsError) => { if (active) setError(groupsError.message) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user) {
      setNotes([])
      setLoading(false)
      return undefined
    }

    let active = true
    setLoading(true)
    getNotes(selectedGroupId)
      .then((items) => {
        if (!active) return
        setNotes(items)
        setError('')
      })
      .catch((loadError) => {
        if (!active) return
        if (loadError.status === 401) {
          setUser(null)
          setError('Your session expired. Please sign in again.')
          return
        }
        setError(loadError.message)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user, selectedGroupId])

  const activeGroup = groups.find((group) => group.id === selectedGroupId)
  const subjects = useMemo(() => [...new Set(notes.map((note) => note.subject))].sort(), [notes])
  const filteredNotes = useMemo(() => notes.filter((note) => {
    const matchesText = `${note.title} ${note.subject} ${note.description || ''}`.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || note.subject === subjectFilter
    const matchesVisibility = showHidden || note.status === 'active'
    return matchesText && matchesSubject && matchesVisibility
  }), [notes, search, subjectFilter, showHidden])
  const sharedCount = notes.filter((note) => note.status === 'active').length
  const subjectCount = new Set(notes.map((note) => note.subject)).size

  function openCreate() {
    setModalNote(null)
    setModalOpen(true)
  }

  function openEdit(note) {
    setModalNote(note)
    setModalOpen(true)
  }

  function selectGroup(groupId) {
    setSelectedGroupId(groupId)
    setSearch('')
    setSubjectFilter('all')
    setShowHidden(false)
    setError('')
  }

  async function saveGroup(mode, values) {
    setGroupSaving(true)
    try {
      const group = mode === 'create'
        ? await createGroup(values)
        : await joinGroup(values.inviteCode)
      setGroups((current) => [...current.filter((item) => item.id !== group.id), group].sort((a, b) => a.name.localeCompare(b.name)))
      selectGroup(group.id)
      setGroupModalOpen(false)
    } finally {
      setGroupSaving(false)
    }
  }

  async function copyInviteCode(group) {
    try {
      await navigator.clipboard.writeText(group.inviteCode)
      setCopiedGroupId(group.id)
      window.setTimeout(() => setCopiedGroupId(''), 1800)
    } catch {
      setError(`Copy the invite code manually: ${group.inviteCode}`)
    }
  }

  async function saveNote(form) {
    setSaving(true)
    try {
      const saved = modalNote ? await updateNote(modalNote._id, form) : await createNote(form)
      setNotes((current) => modalNote
        ? current.map((note) => note._id === saved._id ? saved : note)
        : [saved, ...current])
      setModalOpen(false)
      setError('')
    } finally {
      setSaving(false)
    }
  }

  async function removeNote(note) {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return
    try {
      await deleteNote(note._id)
      setNotes((current) => current.filter((item) => item._id !== note._id))
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function toggleStatus(note) {
    const status = note.status === 'active' ? 'inactive' : 'active'
    try {
      const saved = await updateNoteStatus(note._id, status)
      setNotes((current) => current.map((item) => item._id === saved._id ? saved : item))
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  async function signOut() {
    try {
      await logout()
      setUser(null)
      setNotes([])
      setGroups([])
      setSelectedGroupId(null)
      setError('')
    } catch (logoutError) {
      setError(logoutError.message)
    }
  }

  if (authLoading) {
    return <div className="auth-loading"><LoaderCircle className="spin" size={20} /> Checking your student account…</div>
  }
  if (!user) {
    return <AuthScreen onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); setError('') }} message={error} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Notehaven home">
          <span className="brand-mark"><BookOpen size={21} strokeWidth={2.2} /></span>
          <span>note<span className="brand-light">haven</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button type="button" className={`nav-item ${!selectedGroupId ? 'active' : ''}`} onClick={() => selectGroup(null)}>
            <LayoutDashboard size={18} /> Community
          </button>
          <div className="workspace-label group-label">STUDY GROUPS</div>
          <div className="group-list">
            {groups.map((group) => (
              <button type="button" key={group.id} className={`nav-item group-nav-item ${selectedGroupId === group.id ? 'active' : ''}`} onClick={() => selectGroup(group.id)} title={`${group.name} · ${group.memberCount} members`}>
                <Users size={17} /> <span>{group.name}</span><span className="nav-count">{group.memberCount}</span>
              </button>
            ))}
          </div>
          <button type="button" className="group-create-button" onClick={() => setGroupModalOpen(true)}><Plus size={15} /> Create / join a group</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={17} /></div>
            <strong>Good notes go places.</strong>
            <p>Share what you know. Help someone learn something new.</p>
            <button type="button" onClick={openCreate}>Share a note <ArrowUpRight size={14} /></button>
          </div>
          <a href="mailto:support@notehaven.local" className="help-link"><CircleHelp size={17} /> Help & feedback</a>
          <div className="profile-row">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <span><strong>{user.name}</strong><small>{user.email}</small></span>
            <button type="button" className="sign-out-button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="library">
        <header className="topbar">
          <span className="breadcrumb">Workspace <span>/</span> <strong>{activeGroup?.name || 'Community'}</strong></span>
          <div className="topbar-right">
            <label className="current-group-select">
              <Users size={15} />
              <span className="sr-only">Choose a study group</span>
              <select value={selectedGroupId || 'community'} onChange={(event) => selectGroup(event.target.value === 'community' ? null : event.target.value)}>
                <option value="community">Community library</option>
                {groups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <button type="button" className="topbar-group-add" onClick={() => setGroupModalOpen(true)} aria-label="Create or join a group" title="Create or join a group">
              <Plus size={16} /><span>Groups</span>
            </button>
            <div className="avatar avatar-small">{user.name.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <section className="page-content">
          <div className="welcome-row">
            <div>
              <span className="eyebrow">{activeGroup ? 'YOUR STUDY GROUP' : 'YOUR KNOWLEDGE, SHARED'}</span>
              <h1>{activeGroup ? activeGroup.name : <>A little more <span>in the know.</span></>}</h1>
              <p className="welcome-copy">{activeGroup?.description || (activeGroup ? 'Share notes and learn together with your group.' : 'Find your next aha moment in notes shared by your community.')}</p>
            </div>
            <div className="welcome-actions">
              {activeGroup && (
                <button type="button" className="invite-code-button" onClick={() => copyInviteCode(activeGroup)}>
                  <span><small>GROUP INVITE CODE</small><strong>{activeGroup.inviteCode}</strong></span>
                  <Copy size={15} /> {copiedGroupId === activeGroup.id ? 'Copied' : 'Copy'}
                </button>
              )}
              <button type="button" className="button button-primary create-button" onClick={openCreate}><Plus size={18} /> Share a note</button>
            </div>
          </div>

          <section className="stats-grid" aria-label="Library summary">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon"><FileText size={19} /></div>
              <span className="stat-label">Shared notes</span>
              <strong>{sharedCount.toString().padStart(2, '0')}</strong>
              <small>Ready to explore</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-lavender"><BookOpen size={19} /></div>
              <span className="stat-label">Subjects</span>
              <strong>{subjectCount.toString().padStart(2, '0')}</strong>
              <small>Areas of knowledge</small>
            </div>
            <div className="stat-card stat-card-wide">
              <div className="stat-quote-mark">“</div>
              <p>Knowledge grows<br />when <span>we share it.</span></p>
              <div className="quote-decoration"><Sparkles size={24} /></div>
            </div>
          </section>

          <section className="library-section">
            <div className="section-heading">
              <div>
                <h2>{activeGroup ? 'Group notes' : 'Explore the library'}</h2>
                <p>{activeGroup ? 'Shared with the members of this study group.' : 'A collection made better by every one of us.'}</p>
              </div>
              <button type="button" className={`filter-toggle ${showHidden ? 'filter-active' : ''}`} onClick={() => setShowHidden((value) => !value)}>
                <Filter size={15} /> {showHidden ? 'Showing hidden' : 'Shared only'}
              </button>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <Search size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes, subjects..." aria-label="Search notes" />
                {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}
              </label>
              <label className="subject-select-wrap">
                <span className="sr-only">Filter by subject</span>
                <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
                  <option value="all">All subjects</option>
                  {subjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}
                </select>
                <ChevronDown size={16} />
              </label>
            </div>

            {error && <div className="notice" role="alert"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}

            {loading ? (
              <div className="loading-state"><LoaderCircle className="spin" size={25} /><span>Gathering the good stuff…</span></div>
            ) : filteredNotes.length ? (
              <div className="notes-grid">
                {filteredNotes.map((note) => <NoteCard key={note._id} note={note} canManage={note.owner === user.id} onEdit={openEdit} onDelete={removeNote} onToggleStatus={toggleStatus} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-art"><BookOpen size={30} /><span><Sparkles size={16} /></span></div>
                <h3>{search || subjectFilter !== 'all' ? 'No notes found' : activeGroup ? 'Your group is ready for its first note.' : 'The first page is yours.'}</h3>
                <p>{search || subjectFilter !== 'all' ? 'Try another search or clear your filters.' : activeGroup ? 'Share a useful resource with your group members.' : 'Be the first to share something useful with the community.'}</p>
                {!search && subjectFilter === 'all' && <button type="button" className="button button-primary" onClick={openCreate}><Upload size={16} /> Share a note</button>}
              </div>
            )}
            <div className="list-footer">{filteredNotes.length > 0 && <span>Showing {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}</span>}</div>
          </section>
          <footer className="page-footer"><span>Made for curious minds.</span><span>Notehaven <span className="footer-dot">·</span> 2026</span></footer>
        </section>
      </main>
      {modalOpen && <NoteModal note={modalNote} groupId={selectedGroupId} groupName={activeGroup?.name || 'Community library'} onClose={() => setModalOpen(false)} onSave={saveNote} saving={saving} />}
      {groupModalOpen && <GroupModal onClose={() => setGroupModalOpen(false)} onSave={saveGroup} saving={groupSaving} />}
    </div>
  )
}

export default App
