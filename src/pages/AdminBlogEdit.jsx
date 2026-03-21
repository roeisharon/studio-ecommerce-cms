import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AdminBlogEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const isEditing = !!postId;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    author_name: '',
    is_published: false,
    published_date: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (!isAuth) {
        api.auth.redirectToLogin(createPageUrl('AdminBlogEdit'));
        return;
      }
      const userData = await api.auth.me();
      setUser(userData);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const { data: post } = useQuery({
    queryKey: ['blog-post-edit', postId],
    queryFn: async () => {
      const posts = await api.entities.Blog.filter({ id: postId });
      return posts[0];
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        author_name: post.author_name || '',
        is_published: post.is_published || false,
        published_date: post.published_date || '',
        tags: post.tags || []
      });
    }
  }, [post]);

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Blog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      navigate(createPageUrl('AdminBlog'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.entities.Blog.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      navigate(createPageUrl('AdminBlog'));
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      published_date: form.is_published && !form.published_date 
        ? new Date().toISOString() 
        : form.published_date
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setForm({ ...form, featured_image: file_url });
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err?.code === 'storage/unauthorized'
        ? 'Upload blocked: check your Firebase Storage rules (see README).'
        : `Upload failed: ${err?.message || err?.code || 'unknown error'}`;
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[#5A5A5A]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Link to={createPageUrl('AdminBlog')}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog Posts
          </Button>
        </Link>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">
              {isEditing ? 'Edit Blog Post' : 'Create Blog Post'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                  className="mt-1 rounded-none"
                />
                <p className="text-xs text-[#5A5A5A] mt-1">
                  Leave empty to auto-generate from title
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3}
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <div className="mt-1">
                  <ReactQuill
                    value={form.content}
                    onChange={(value) => setForm({ ...form, content: value })}
                    className="bg-white"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Featured Image</Label>
                {uploadError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Upload Error:</strong> {uploadError}
                  </div>
                )}
                {form.featured_image ? (
                  <div className="mt-2 relative">
                    <img 
                      src={form.featured_image} 
                      alt="Featured" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, featured_image: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 border-2 border-dashed rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-[#C4785A] transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-[#C4785A] animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="mt-2 text-sm text-[#5A5A5A]">
                          Click to upload image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2 mb-3 flex-wrap">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-[#FAF7F2] text-[#8B9A7D] rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag"
                    className="rounded-none"
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="rounded-none">
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-lg">
                <div>
                  <Label htmlFor="is_published" className="cursor-pointer">
                    Publish Post
                  </Label>
                  <p className="text-xs text-[#5A5A5A] mt-1">
                    Make this post visible to the public
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={form.is_published}
                  onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                />
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#C4785A] hover:bg-[#B36A4C] rounded-none flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Post' : 'Create Post'}
                    </>
                  )}
                </Button>
                <Link to={createPageUrl('AdminBlog')}>
                  <Button type="button" variant="outline" className="rounded-none">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}