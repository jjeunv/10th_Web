import { useState, useEffect } from "react";
import Modal from "../../../shared/components/Modal";
import { useLpMutation } from "../hooks/useLpMutation";

interface LpModalProps {
  onClose: () => void;
  lpId?: number;
  initialData?: { title: string; content: string; tags: string[] };
}

const LpModal = ({ onClose, lpId, initialData }: LpModalProps) => {
  const isEditMode = !!lpId && !!initialData;

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(initialData?.title ?? "");
  const [content, setContent] = useState<string>(initialData?.content ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState<string>("");

  useEffect(() => {
    return () => {
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [thumbnailUrl]);

  const { mutate } = useLpMutation(lpId);

  const handleSubmit = () => {
    mutate({ title, content, tags, published: true }, { onSuccess: () => onClose() });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const handleDeleteTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <Modal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 transition text-lg leading-none"
          >
            ✕
          </button>

          <div className="mb-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 gap-2">
            {thumbnail ? (
              <img
                src={thumbnailUrl ?? undefined}
                alt="미리보기"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-neutral-200 flex items-center justify-center text-5xl text-neutral-400">
                ◉
              </div>
            )}
            <label className="cursor-pointer text-xs text-amber font-semibold hover:underline">
              사진 선택
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setThumbnail(file);
                  setThumbnailUrl(file ? URL.createObjectURL(file) : null);
                }}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="LP Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-amber/60 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.07)] transition-all"
            />
            <input
              type="text"
              placeholder="LP Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-amber/60 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.07)] transition-all"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="LP Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-amber/60 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.07)] transition-all"
              />
              <button
                onClick={handleAddTag}
                className="rounded-lg bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-200 transition"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex gap-2 rounded-full bg-amber/10 px-3 py-1 text-xs font-semibold text-amber"
                  >
                    <span>#{tag}</span>
                    <button onClick={() => handleDeleteTag(i)}>x</button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="mt-1 w-full rounded-lg bg-amber py-3 text-sm font-semibold text-white hover:bg-amber/90 active:scale-[0.98] transition-all"
            >
              {isEditMode ? "수정하기" : "Add LP"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LpModal;
