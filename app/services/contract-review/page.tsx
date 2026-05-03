'use client'

import { useState } from 'react'
import { supabase } from "@/app/lib/supabase/client";


export default function ContractReviewPage() {
  const [file, setFile] = useState<File | null>(null)
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async () => {
    if (!file || !country) {
      setMessage('Please select a file and country')
      return
    }

    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in')
      setLoading(false)
      return
    }

    // STEP A: create DB row
    const { data: uploadRow, error: insertError } = await supabase
      .from('contract_uploads')
      .insert({
        user_id: user.id,
        file_path: 'pending',
        original_filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        country_code: country,
        upload_status: 'uploaded',
        extraction_status: 'pending',
        analysis_status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      setMessage(insertError.message)
      setLoading(false)
      return
    }

    // STEP B: upload file
    const filePath = `${user.id}/${uploadRow.id}/${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('contract-uploads')
      .upload(filePath, file)

    if (uploadError) {
      setMessage(uploadError.message)
      setLoading(false)
      return
    }

    // STEP C: update file path
    await supabase
      .from('contract_uploads')
      .update({ file_path: filePath })
      .eq('id', uploadRow.id)

    // STEP D: call backend
    await supabase.functions.invoke('analyze-contract', {
      body: { contract_upload_id: uploadRow.id },
    })

    setMessage('Upload successful. Analysis started...')
    setLoading(false)
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contract Review</h1>

      <select
        className="w-full border p-2 mb-4"
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">Select Country</option>
        <option value="UAE">UAE</option>
        <option value="QAT">Qatar</option>
        <option value="SAU">Saudi Arabia</option>
      </select>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload Contract'}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}