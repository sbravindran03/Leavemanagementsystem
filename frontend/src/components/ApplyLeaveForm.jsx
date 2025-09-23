// import React, { useState } from "react";

// export default function ApplyLeaveForm() {
//   const [type, setType] = useState("Casual");
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [reason, setReason] = useState("");

//   function handleApply(e) {
//     e.preventDefault();
//     console.log({ type, from, to, reason });
//     alert("Leave applied (mock). Connect to backend to persist.");
//   }

//   return (
//     <section className="apply-form">
//       <h2>Apply for Leave</h2>
//       <form onSubmit={handleApply}>
//         <label>
//           <span>Type</span>
//           <select value={type} onChange={(e) => setType(e.target.value)}>
//             <option>Casual</option>
//             <option>Sick</option>
//             <option>Paid</option>
//             <option>Work from Home</option>
//           </select>
//         </label>

//         <label>
//           <span>From</span>
//           <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
//         </label>

//         <label>
//           <span>To</span>
//           <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
//         </label>

//         <label className="full">
//           <span>Reason</span>
//           <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="4" />
//         </label>

//         <div className="form-actions">
//           <button type="submit" className="btn primary">Apply</button>
//           <button type="button" className="btn ghost" onClick={() => alert("Saved draft (mock).")}>Save Draft</button>
//         </div>
//       </form>
//     </section>
//   );
// }

// src/components/ApplyLeaveForm.jsx




// import React, { useState } from 'react'
// import { useAuth } from '../auth/AuthProvider'

// export default function ApplyLeaveForm() {
//   const { apiFetch } = useAuth()
//   const [type, setType] = useState('Casual')
//   const [from, setFrom] = useState('')
//   const [to, setTo] = useState('')
//   const [reason, setReason] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [success, setSuccess] = useState(null)

//   async function handleApply(e) {
//     e.preventDefault()
//     setError(null)
//     setSuccess(null)
//     if (!from || !to) {
//       setError('Please select both from and to dates.')
//       return
//     }
//     setLoading(true)
//     try {
//       const payload = { type, from, to, reason }
//       const res = await apiFetch('/api/leaves', {
//         method: 'POST',
//         body: JSON.stringify(payload),
//       })
//       setSuccess('Leave applied.')
//       // notify other components to refresh
//       window.dispatchEvent(new CustomEvent('leaves:updated'))
//       // clear form
//       setType('Casual')
//       setFrom('')
//       setTo('')
//       setReason('')
//     } catch (err) {
//       console.error('Apply leave failed', err)
//       setError(err.message || 'Failed to apply leave')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <section className="apply-form modern-card">
//       <div className="card-header">
//         <h2>Apply for Leave</h2>
//       </div>

//       <div className="card-body">
//         <form onSubmit={handleApply}>
//           <label>
//             <span>Type</span>
//             <select value={type} onChange={(e) => setType(e.target.value)}>
//               <option>Casual</option>
//               <option>Sick</option>
//               <option>Paid</option>
//               <option>Work from Home</option>
//               <option>Other</option>
//             </select>
//           </label>

//           <label>
//             <span>From</span>
//             <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
//           </label>

//           <label>
//             <span>To</span>
//             <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
//           </label>

//           <label className="full">
//             <span>Reason</span>
//             <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
//           </label>

//           {error && <div className="form-error">{error}</div>}
//           {success && <div className="form-success">{success}</div>}

//           <div className="form-actions">
//             <button className="btn primary" type="submit" disabled={loading}>
//               {loading ? 'Applying...' : 'Apply'}
//             </button>
//             <button type="button" className="btn ghost" onClick={() => { setType('Casual'); setFrom(''); setTo(''); setReason('') }}>
//               Reset
//             </button>
//           </div>
//         </form>
//       </div>
//     </section>
//   )
// }



// src/components/ApplyLeaveForm.jsx


// import React, { useState } from 'react'
// import { useAuth } from '../auth/AuthProvider'

// export default function ApplyLeaveForm() {
//   const { apiFetch } = useAuth()
//   const [type, setType] = useState('Casual')
//   const [from, setFrom] = useState('')
//   const [to, setTo] = useState('')
//   const [reason, setReason] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [success, setSuccess] = useState(null)

//   async function handleApply(e) {
//     e.preventDefault()
//     setError(null)
//     setSuccess(null)
//     if (!from || !to) {
//       setError('Please select both from and to dates.')
//       return
//     }
//     setLoading(true)
//     try {
//       // send the `type` value (e.g. 'WFH') that matches backend enum
//       const payload = { type, from, to, reason }
//       const res = await apiFetch('/api/leaves', {
//         method: 'POST',
//         body: JSON.stringify(payload),
//       })
//       setSuccess('Leave applied.')
//       window.dispatchEvent(new CustomEvent('leaves:updated'))
//       setType('Casual')
//       setFrom('')
//       setTo('')
//       setReason('')
//     } catch (err) {
//       console.error('Apply leave failed', err)
//       setError(err.message || 'Failed to apply leave')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <section className="apply-form modern-card">
//       <div className="card-header">
//         <h2>Apply for Leave</h2>
//       </div>

//       <div className="card-body">
//         <form onSubmit={handleApply}>
//           <label>
//             <span>Type</span>
//             <select value={type} onChange={(e) => setType(e.target.value)}>
//               <option value="Casual">Casual</option>
//               <option value="Sick">Sick</option>
//               <option value="Paid">Paid</option>
//               <option value="WFH">Work from Home</option>
//               <option value="Other">Other</option>
//             </select>
//           </label>

//           <label>
//             <span>From</span>
//             <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
//           </label>

//           <label>
//             <span>To</span>
//             <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
//           </label>

//           <label className="full">
//             <span>Reason</span>
//             <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
//           </label>

//           {error && <div className="form-error">{error}</div>}
//           {success && <div className="form-success">{success}</div>}

//           <div className="form-actions">
//             <button className="btn primary" type="submit" disabled={loading}>
//               {loading ? 'Applying...' : 'Apply'}
//             </button>
//             <button type="button" className="btn ghost" onClick={() => { setType('Casual'); setFrom(''); setTo(''); setReason('') }}>
//               Reset
//             </button>
//           </div>
//         </form>
//       </div>
//     </section>
//   )
// }





// src/components/ApplyLeaveForm.jsx
import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ApplyLeaveForm() {
  const { apiFetch } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    type: 'Sick',
    from: '',
    to: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/api/leaves', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      toast.success('Leave applied successfully!')  // ✅ show toast
      navigate('/', { replace: true })             // ✅ redirect to dashboard
    } catch (err) {
      toast.error(err.message || 'Failed to apply leave')  // ✅ error toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="apply-form modern-card">
      <h2>Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          <span>Type</span>
          <select name="type" value={form.type} onChange={update}>
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
            <option value="Paid">Paid</option>
            <option value="WFH">WFH</option>
          </select>
        </label>

        <label>
          <span>From</span>
          <input type="date" name="from" value={form.from} onChange={update} required />
        </label>

        <label>
          <span>To</span>
          <input type="date" name="to" value={form.to} onChange={update} required />
        </label>

        <label>
          <span>Reason</span>
          <textarea name="reason" rows="3" value={form.reason} onChange={update} required />
        </label>

        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </section>
  )
}
