/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Hash } from 'lucide-react';
import { Globe, LockKey } from '@phosphor-icons/react';
import { api } from '@/lib/api-client';
import { ImageUploader } from '@/components/ui/ImageUploader';

export default function EditRecipePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.recipeId as string;

  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'steps' | 'tags'>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Recipe basic info state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState('EASY');
  const [categoryId, setCategoryId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [thumbnail, setThumbnail] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  // Sub-resources state
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  
  // Tags state
  const [allTags, setAllTags] = useState<any[]>([]);
  const [recipeTagIds, setRecipeTagIds] = useState<(string | number)[]>([]);
  const [newTagName, setNewTagName] = useState('');

  // New sub-resource input state
  const [newIngName, setNewIngName] = useState('');
  const [newIngQuantity, setNewIngQuantity] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('');

  const [newStepContent, setNewStepContent] = useState('');

  useEffect(() => {
    if (!user.isVerified) {
      router.push('/');
    }
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [recipeData, cats, tagList] = await Promise.all([
        api.recipes.get(recipeId),
        api.categories.list().catch(() => []),
        api.tags.list().catch(() => []),
      ]);

      setTitle(recipeData.title || '');
      setDescription(recipeData.description || '');
      setCalories(recipeData.calories ? String(recipeData.calories) : '');
      setCookTime(recipeData.cookTime ? String(recipeData.cookTime) : '');
      setServings(recipeData.servings ? String(recipeData.servings) : '4');
      setDifficulty(recipeData.difficulty || 'EASY');
      setCategoryId(recipeData.categoryId ? String(recipeData.categoryId) : '');
      setIsPublic(recipeData.isPublic !== undefined ? Boolean(recipeData.isPublic) : true);
      setThumbnail(recipeData.thumbnail || '');

      setIngredients(recipeData.ingredients || []);
      setSteps(recipeData.steps || []);
      setCategories(Array.isArray(cats) ? cats : []);
      setAllTags(Array.isArray(tagList) ? tagList : []);

      // Extract existing recipe tag IDs
      const existingTagIds = (recipeData.tags || []).map((t: any) => t.id);
      setRecipeTagIds(existingTagIds);
    } catch (err: any) {
      console.error('Failed to load recipe for edit:', err);
      setErrorMsg(err.message || 'Không tìm thấy công thức này!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) loadData();
  }, [recipeId]);

  // Toggle Tag association
  const handleToggleTag = async (tagId: string | number) => {
    const isAttached = recipeTagIds.map(String).includes(String(tagId));
    const currentUserId = user.id || 1;
    setSaving(true);
    try {
      if (isAttached) {
        await api.recipeTags.remove(recipeId, tagId, currentUserId);
        setRecipeTagIds(recipeTagIds.filter((t) => String(t) !== String(tagId)));
      } else {
        await api.recipeTags.add(recipeId, tagId, currentUserId);
        setRecipeTagIds([...recipeTagIds, tagId]);
      }
    } catch (err: any) {
      alert(err.message || 'Cập nhật Tag thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Add a new custom tag
  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    const currentUserId = user.id || 1;
    setSaving(true);
    try {
      const created = await api.tags.create(newTagName.trim());
      setNewTagName('');
      // Associate with recipe immediately
      if (created?.id) {
        await api.recipeTags.add(recipeId, created.id, currentUserId).catch(console.error);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Thêm Tag mới thất bại');
    } finally {
      setSaving(false);
    }
  };



  // Update basic info
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên món ăn!');
      return;
    }

    if (!thumbnail.trim()) {
      setErrorMsg('Vui lòng tải lên ảnh món ăn trước khi lưu!');
      return;
    }

    const currentUserId = user.id || 1;
    if (servings && Number(servings) < 1) {
      setErrorMsg('Khẩu phần ăn phải lớn hơn hoặc bằng 1!');
      return;
    }
    if (calories && Number(calories) < 0) {
      setErrorMsg('Số lượng calo không được là số âm!');
      return;
    }
    if (cookTime && Number(cookTime) < 0) {
      setErrorMsg('Thời gian nấu không được là số âm!');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.recipes.update(recipeId, {
        userId: currentUserId,
        title: title.trim(),
        description: description.trim() || undefined,
        calories: calories ? Number(calories) : undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        servings: servings ? Number(servings) : 4,
        difficulty: difficulty,
        categoryId: categoryId ? Number(categoryId) : undefined,
        thumbnail: thumbnail.trim() || undefined,
        isPublic: isPublic,
      });

      setSuccessMsg('Cập nhật thông tin cơ bản thành công! Đang quay lại trang chi tiết...');
      setTimeout(() => {
        router.push(`/my-recipes/${recipeId}`);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Add new ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;
    if (newIngQuantity !== '' && Number(newIngQuantity) < 0) {
      alert('Số lượng nguyên liệu không được là số âm!');
      return;
    }

    const currentUserId = user.id || 1;
    setSaving(true);
    try {
      await api.ingredients.add(recipeId, {
        ingredientName: newIngName.trim(),
        quantity: newIngQuantity ? Number(newIngQuantity) : undefined,
        unit: newIngUnit.trim() || undefined,
        displayOrder: ingredients.length + 1,
        userId: currentUserId,
      }, currentUserId);
      setNewIngName('');
      setNewIngQuantity('');
      setNewIngUnit('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Thêm nguyên liệu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Delete ingredient
  const handleDeleteIngredient = async (ingId: string | number) => {
    if (!confirm('Xóa nguyên liệu này?')) return;
    const currentUserId = user.id || 1;
    try {
      await api.ingredients.remove(ingId, currentUserId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  // Add new step
  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepContent.trim()) return;

    const currentUserId = user.id || 1;
    setSaving(true);
    try {
      await api.steps.add(recipeId, {
        stepNumber: steps.length + 1,
        content: newStepContent.trim(),
        userId: currentUserId,
      }, currentUserId);
      setNewStepContent('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Thêm bước thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Delete step & re-sequence remaining step numbers
  const handleDeleteStep = async (stepId: string | number) => {
    if (!confirm('Xóa bước này?')) return;
    const currentUserId = user.id || 1;
    setSaving(true);
    try {
      await api.steps.remove(stepId, currentUserId);
      const remaining = steps.filter((s) => String(s.id) !== String(stepId));
      for (let i = 0; i < remaining.length; i++) {
        const targetNumber = i + 1;
        if (Number(remaining[i].stepNumber) !== targetNumber) {
          await api.steps.update(remaining[i].id, {
            stepNumber: targetNumber,
            content: remaining[i].content,
            userId: currentUserId,
          }, currentUserId).catch(console.error);
        }
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Reorder step up or down
  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const currentUserId = user.id || 1;
    const stepA = steps[index];

    setSaving(true);
    try {
      await api.steps.update(stepA.id, {
        stepNumber: targetIndex + 1,
        content: stepA.content,
        userId: currentUserId,
      }, currentUserId);

      loadData();
    } catch (err: any) {
      alert(err.message || 'Sắp xếp bước thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Cancel edits and return to detail page
  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn HỦY TẤT CẢ thay đổi chưa lưu và quay lại trang chi tiết không?')) {
      router.push(`/my-recipes/${recipeId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-neutral-500">
        <div className="text-4xl mb-3 animate-bounce">⏳</div>
        <p className="font-medium text-lg">Đang tải dữ liệu công thức...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl pb-24">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={handleCancel}
          className="text-orange-500 hover:text-orange-600 font-medium mb-2 inline-flex items-center gap-1 text-sm"
        >
          &larr; Quay lại chi tiết công thức
        </button>
        <h1 className="text-3xl font-bold text-neutral-900">Chỉnh sửa công thức</h1>
        <p className="text-neutral-500 text-sm mt-1">ID công thức: #{recipeId}</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-8 bg-white p-2 rounded-2xl border shadow-sm">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 font-medium rounded-xl text-sm transition-all ${
            activeTab === 'info'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          Thông tin cơ bản
        </button>
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 py-3 font-medium rounded-xl text-sm transition-all ${
            activeTab === 'ingredients'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          Nguyên liệu ({ingredients.length})
        </button>
        <button
          onClick={() => setActiveTab('steps')}
          className={`flex-1 py-3 font-medium rounded-xl text-sm transition-all ${
            activeTab === 'steps'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          Các bước nấu ({steps.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-3 font-medium rounded-xl text-sm transition-all ${
            activeTab === 'tags'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          Thẻ Tags ({recipeTagIds.length})
        </button>
      </div>

      {/* Tab 1: Basic Info */}
      {activeTab === 'info' && (
        <form onSubmit={handleUpdateInfo} className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          
          {/* Privacy Option */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Quyền riêng tư <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  isPublic
                    ? 'bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/20 text-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Globe size={30} weight="duotone" className="text-emerald-500" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-sm">Công khai (Public)</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Mọi người đều có thể tìm thấy và xem công thức này</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  !isPublic
                    ? 'bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/20 text-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <LockKey size={30} weight="duotone" className="text-slate-500" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-sm">Riêng tư (Private)</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Chỉ một mình bạn có thể xem công thức này</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tên món ăn <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Mô tả món ăn</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-neutral-900"
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Số người ăn</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Số Calo (kcal)</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Thời gian nấu (phút)</label>
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-neutral-900"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={String(cat.id)} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <ImageUploader value={thumbnail} onChange={setThumbnail} label="Hình ảnh món ăn thành phẩm" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 text-sm"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi thông tin cơ bản'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Ingredients Management */}
      {activeTab === 'ingredients' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">Danh sách nguyên liệu hiện có</h2>
          
          {ingredients.length === 0 ? (
            <p className="text-neutral-400 text-sm">Chưa có nguyên liệu nào.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {ingredients.map((ing) => (
                <div key={String(ing.id)} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900">{ing.ingredientName}</span>
                    {(ing.quantity || ing.unit) && (
                      <span className="text-sm text-neutral-500 ml-2">({ing.quantity || ''} {ing.unit || ''})</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteIngredient(ing.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Xóa nguyên liệu"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form add ingredient */}
          <form onSubmit={handleAddIngredient} className="pt-6 border-t border-neutral-200 space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Thêm nguyên liệu mới</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="text"
                value={newIngName}
                onChange={(e) => setNewIngName(e.target.value)}
                placeholder="Tên nguyên liệu"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 text-sm"
              />
              <input
                type="number"
                min="0"
                value={newIngQuantity}
                onChange={(e) => setNewIngQuantity(e.target.value.replace(/^-/, ''))}
                placeholder="Số lượng"
                className="w-28 px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 text-sm"
              />
              <input
                type="text"
                value={newIngUnit}
                onChange={(e) => setNewIngUnit(e.target.value)}
                placeholder="Đơn vị"
                className="w-28 px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 text-sm"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
              >
                + Thêm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Steps Management */}
      {activeTab === 'steps' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">Danh sách các bước hiện có</h2>

          {steps.length === 0 ? (
            <p className="text-neutral-400 text-sm">Chưa có bước thực hiện nào.</p>
          ) : (
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={String(step.id)} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'up')}
                        disabled={idx === 0 || saving}
                        className="w-5 h-5 rounded bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 disabled:opacity-30 text-[10px] font-bold flex items-center justify-center transition-colors shadow-sm"
                        title="Chuyển lên"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'down')}
                        disabled={idx === steps.length - 1 || saving}
                        className="w-5 h-5 rounded bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 disabled:opacity-30 text-[10px] font-bold flex items-center justify-center transition-colors shadow-sm"
                        title="Chuyển xuống"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <p className="flex-1 text-neutral-800 text-sm pt-1 leading-relaxed">{step.content}</p>
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors text-sm shrink-0"
                    title="Xóa bước này"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form add step */}
          <form onSubmit={handleAddStep} className="pt-6 border-t border-neutral-200 space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Thêm bước thực hiện tiếp theo</h3>
            <textarea
              required
              rows={3}
              value={newStepContent}
              onChange={(e) => setNewStepContent(e.target.value)}
              placeholder={`Nội dung cho bước ${steps.length + 1}...`}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 resize-none text-sm"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors"
              >
                + Thêm bước nấu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Tags Management */}
      {activeTab === 'tags' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">Quản lý Thẻ phân loại (Tags) của món ăn</h2>
          <p className="text-neutral-500 text-sm">Nhấp vào thẻ tag để gắn hoặc gỡ khỏi món ăn. Thêm tag mới ở bên dưới.</p>

          {/* Add custom tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewTag();
                }
              }}
              placeholder="Tên tag mới (vd: Ăn vặt, Tiết kiệm)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
            />
            <button
              type="button"
              onClick={handleAddNewTag}
              disabled={saving || !newTagName.trim()}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Thêm Tag mới
            </button>
          </div>

          {/* Tag Chips Grid */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            {allTags.map((tag) => {
              const isAttached = recipeTagIds.map(String).includes(String(tag.id));
              return (
                <button
                  type="button"
                  key={String(tag.id)}
                  onClick={() => handleToggleTag(tag.id)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5 ${
                    isAttached
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {isAttached ? <Check className="size-4" aria-hidden="true" /> : <Hash className="size-4" aria-hidden="true" />}
                  <span>{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
