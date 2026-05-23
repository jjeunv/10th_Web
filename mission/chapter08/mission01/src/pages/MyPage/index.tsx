import { useState } from "react";
import { useMyInfo } from "./hooks/useMyInfo";
import { useUpdateMyInfo } from "./hooks/useUpdateMyInfo";

const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const { data: user, isPending } = useMyInfo();
  const { mutate: updateUser } = useUpdateMyInfo(() => setIsEditing(false));

  const handleEdit = () => {
    setName(user?.name ?? "");
    setBio(user?.bio ?? "");
    setIsEditing(true);
  };

  const handleSubmit = () => {
    updateUser({ name, bio: bio || undefined });
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-amber border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-display tracking-widest text-amber mb-8">
        마이 페이지
      </h1>

      <div className="rounded-2xl bg-neutral-900 p-8 flex gap-6 items-center">
        <div className="w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl text-neutral-400">◉</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-amber/60 transition"
                  placeholder="이름"
                />
                <button
                  onClick={handleSubmit}
                  className="text-amber hover:text-amber/70 transition text-lg"
                >
                  ✓
                </button>
              </div>
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-amber/60 transition"
                placeholder="bio (선택)"
              />
              <p className="text-xs text-neutral-400">{user?.email}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{user?.name}</span>
                <button
                  onClick={handleEdit}
                  className="text-neutral-400 hover:text-white transition text-xs"
                >
                  ✎
                </button>
              </div>
              {user?.bio && (
                <p className="text-sm text-neutral-400">{user.bio}</p>
              )}
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
