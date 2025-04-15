// pages/dashboard/artist.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [style, setStyle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [message, setMessage] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('You must be logged in to submit artwork.');
      return;
    }

    if (!imageFile) {
      setMessage('Please select an image file.');
      return;
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('artwork')
      .upload(filePath, imageFile);

    if (storageError) {
      setMessage(`Upload failed: ${storageError.message}`);
      return;
    }

    const { error: insertError } = await supabase.from('artworks').insert([
      {
        title,
        description,
        price,
        style,
        image_url: storageData?.path,
        artist_id: user.id,
      },
    ]);

    if (insertError) {
      setMessage(`Insert failed: ${insertError.message}`);
    } else {
      setMessage('✅ Artwork submitted!');
      setTitle('');
      setDescription('');
      setPrice('');
      setStyle('');
      setImageFile(null);
      setPreviewUrl('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-black p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload Your Artwork</h1>

        <div className="mb-8 p-4 bg-gray-50 border rounded">
          <h2 className="text-lg font-semibold mb-2">Upload Guidelines</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Photograph artwork in good lighting</li>
            <li>Use a clean white background</li>
            <li>Ensure the image is in focus and fits the frame fully</li>
          </ul>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price (£)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border p-3 rounded"
            required
          >
            <option value="">Select Art Style</option>
            <option value="abstract">Abstract</option>
            <option value="realism">Realism</option>
            <option value="minimalist">Minimalist</option>
            <option value="popart">Pop Art</option>
            <option value="other">Other</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-3 rounded bg-white"
            required
          />

          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Preview:</p>
              <img src={previewUrl} alt="Preview" className="mt-2 w-64 h-auto border rounded" />
            </div>
          )}

          <button
            type="submit"
            className="bg-black text-white w-full py-3 rounded hover:bg-gray-800 transition"
          >
            Submit Artwork
          </button>

          {message && <p className="mt-2 text-center text-sm text-green-600">{message}</p>}
        </form>
      </div>
    </>
  );
}
