import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [style, setStyle] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [displayType, setDisplayType] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string>('');
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

  const handleCroppedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCroppedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCroppedPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCroppedPreviewUrl('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage('You must be logged in to submit artwork.');
      return;
    }

    if (!imageFile) {
      setMessage('Please select the main image.');
      return;
    }

    const timestamp = Date.now();

    const mainExt = imageFile.name.split('.').pop();
    const mainFileName = `${timestamp}.${mainExt}`;
    const mainPath = mainFileName;

    const { data: mainData, error: mainError } = await supabase.storage
      .from('artwork')
      .upload(mainPath, imageFile);

    if (mainError) {
      setMessage(`Main image upload failed: ${mainError.message}`);
      return;
    }

    let croppedPath = '';
    if (croppedFile) {
      const croppedExt = croppedFile.name.split('.').pop();
      const croppedFileName = `${timestamp}_cropped.${croppedExt}`;
      croppedPath = croppedFileName;

      const { error: croppedError } = await supabase.storage
        .from('artwork')
        .upload(croppedPath, croppedFile);

      if (croppedError) {
        setMessage(`Cropped image upload failed: ${croppedError.message}`);
        return;
      }
    }

    const { error: insertError } = await supabase.from('artworks').insert([
      {
        title,
        description,
        price: parseFloat(price),
        shipping_cost: parseFloat(shippingCost),
        style,
        width_cm: parseFloat(widthCm),
        height_cm: parseFloat(heightCm),
        display_type: displayType,
        image_url: mainData?.path,
        cropped_image_url: croppedPath || null,
        artist_id: user.id,
        sold: false,
      },
    ]);

    if (insertError) {
      setMessage(`Insert failed: ${insertError.message}`);
    } else {
      setMessage('✅ Artwork submitted!');
      setTitle('');
      setDescription('');
      setPrice('');
      setShippingCost('');
      setStyle('');
      setWidthCm('');
      setHeightCm('');
      setDisplayType('');
      setImageFile(null);
      setPreviewUrl('');
      setCroppedFile(null);
      setCroppedPreviewUrl('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8f8f8] px-4 py-10">
        <div className="max-w-xl mx-auto bg-white shadow-sm rounded-2xl p-8">
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
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="number"
              placeholder="Shipping Cost (£)"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              required
            />
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="number"
              step="0.1"
              placeholder="Width (cm)"
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value)}
              required
            />
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="number"
              step="0.1"
              placeholder="Height (cm)"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
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

            {/* New display_type dropdown */}
            <select
              className="border border-black p-2 w-full rounded text-black"
              value={displayType}
              onChange={(e) => setDisplayType(e.target.value)}
              required
            >
              <option value="">Select Display Type</option>
              <option value="paper">Paper</option>
              <option value="canvas">Canvas</option>
              <option value="framed">Framed</option>
            </select>

            <label className="text-black block">Main Image:</label>
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-black mb-2">Main Image Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="rounded shadow-sm max-h-64 object-cover"
                />
              </div>
            )}

            <label className="text-black block mt-4">Cropped Image (optional):</label>
            <input
              className="border border-black p-2 w-full rounded text-black"
              type="file"
              accept="image/*"
              onChange={handleCroppedChange}
            />

            {croppedPreviewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-black mb-2">Cropped Image Preview:</p>
                <img
                  src={croppedPreviewUrl}
                  alt="Cropped Preview"
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

