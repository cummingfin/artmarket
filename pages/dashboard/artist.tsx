// pages/dashboard/artist.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function ArtistDashboard() {
  const router = useRouter();
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

    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !imageFile) return;

    const fileExt = imageFile.name.split('.').pop();
    const filePath = `artworks/${Date.now()}.${fileExt}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('artwork')
      .upload(filePath, imageFile);

    if (storageError) {
      setMessage(storageError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from('artworks')
      .insert([
        {
          title,
          description,
          price,
          style,
          image_url: storageData?.path,
          status: 'pending',
          artist_id: user.id,
        },
      ]);

    if (insertError) {
      setMessage(insertError.message);
    } else {
      setMessage('Artwork submitted for review!');
      setTitle('');
      setDescription('');
      setPrice('');
      setStyle('');
      setImageFile(null);
      setPreviewUrl('');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">Artist Dashboard</h1>

      <div className="mb-8 p-4 border border-gray-300 rounded">
        <h2 className="text-lg font-semibold mb-2">Upload Guidelines</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>Photograph artwork in good lighting</li>
          <li>Use a clean white background</li>
          <li>Ensure the image is in focus and fits the frame fully</li>
        </ul>
      </div>

      <form className="space-y-4" onSubmit={handleUpload}>
        <input
          className="border p-2 w-full"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          type="number"
          placeholder="Price (£)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select
          className="border p-2 w-full"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
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
          className="border p-2 w-full"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Preview:</p>
            <img src={previewUrl} alt="Preview" className="mt-2 max-w-xs border" />
          </div>
        )}

        <button className="bg-black text-white px-4 py-2" type="submit">
          Submit Artwork
        </button>
        {message && <p className="mt-2 text-green-600">{message}</p>}
      </form>
    </div>
  );
}
