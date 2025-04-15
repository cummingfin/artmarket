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
      <div className="min-h-screen bg-[#f8f8f8] px-4 py-10">
        <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">Submit New Artwork</h1>

          <form className="space-y-4" onSubmit={handleUpload}>
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="border border-black p-2 w-full rounded text-black"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="number"
              placeholder="Price (£)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <select
              className="border border-black p-2 w-full rounded text-black"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              required
            >
              <option value="">Select Style</option>
              <option value="abstract">Abstract</option>
              <option value="realism">Realism</option>
              <option value="minimalist">Minimalist</option>
              <option value="popart">Pop Art</option>
              <option value="other">Other</option>
            </select>

            <input
              className="border border-black p-2 w-full rounded text-black"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-black mb-2">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="rounded shadow-sm max-h-64 object-cover"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Submit Artwork
            </button>

            {message && <p className="text-sm text-center mt-2 text-green-600">{message}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
