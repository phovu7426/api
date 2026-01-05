import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Post } from '@/shared/entities/post.entity';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { User } from '@/shared/entities/user.entity';
import { PostStatus, PostType } from '@/shared/enums';

@Injectable()
export class SeedPosts {
  private readonly logger = new Logger(SeedPosts.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding posts...');

    const postRepo = this.dataSource.getRepository(Post);
    const categoryRepo = this.dataSource.getRepository(PostCategory);
    const tagRepo = this.dataSource.getRepository(PostTag);
    const userRepo = this.dataSource.getRepository(User);

    // Check if posts already exist
    const existingPosts = await postRepo.count();
    if (existingPosts > 0) {
      this.logger.log(`Found ${existingPosts} existing posts. Skipping seed. Use --refresh flag to clear and reseed.`);
      return;
    }

    // Get all categories, tags, and users for random assignment
    const allCategories = await categoryRepo.find();
    const allTags = await tagRepo.find();
    const allUsers = await userRepo.find();

    if (allCategories.length === 0 || allTags.length === 0 || allUsers.length === 0) {
      this.logger.warn('Categories, tags, or users not found. Please seed them first.');
      return;
    }

    // Generate 30 posts with diverse content
    const postTitles = [
      'Hướng dẫn lập trình NestJS từ cơ bản đến nâng cao',
      'Tìm hiểu TypeScript cho người mới bắt đầu',
      'Xây dựng RESTful API với Node.js và Express',
      'React Hooks: Cách sử dụng hiệu quả',
      'Vue.js 3 Composition API - Những điều cần biết',
      'GraphQL vs REST API: So sánh chi tiết',
      'Docker và Kubernetes cho ứng dụng production',
      'Tối ưu hóa hiệu suất database MySQL',
      'Xây dựng ứng dụng real-time với WebSocket',
      'Authentication và Authorization trong NestJS',
      'Testing với Jest và Supertest',
      'Microservices architecture pattern',
      'CI/CD với GitHub Actions',
      'Security best practices cho web application',
      'SEO optimization cho website',
      'Responsive design với CSS Grid và Flexbox',
      'State management với Redux',
      'TypeScript advanced types và generics',
      'Database design và normalization',
      'API documentation với Swagger',
      'Error handling và logging',
      'Code review best practices',
      'Git workflow cho team development',
      'Performance monitoring và optimization',
      'Cloud deployment với AWS',
      'Mobile app development với React Native',
      'Progressive Web App (PWA) development',
      'Machine Learning basics với Python',
      'Blockchain và cryptocurrency',
      'AI và ChatGPT integration',
    ];

    // Định nghĩa các bài viết video, audio, image
    const videoPostIndices = [0, 2, 5, 8, 12, 15, 18, 22]; // 8 bài video
    const audioPostIndices = [3, 7, 11, 16, 20, 24]; // 6 bài audio
    const imagePostIndices = [1, 6, 10, 14, 19, 23, 26]; // 7 bài image
    // Còn lại là text (mặc định)

    const statuses: Array<PostStatus> = [
      PostStatus.PUBLISHED,
      PostStatus.PUBLISHED,
      PostStatus.PUBLISHED,
      PostStatus.DRAFT,
      PostStatus.PUBLISHED
    ];

    // Video URLs mẫu (có thể thay bằng URLs thực tế)
    const sampleVideoUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/123456789',
      'https://example.com/videos/tutorial-1.mp4',
      'https://example.com/videos/tutorial-2.mp4',
      'https://www.youtube.com/watch?v=example1',
      'https://example.com/videos/demo.mp4',
      'https://vimeo.com/987654321',
      'https://example.com/videos/guide.mp4',
    ];

    // Audio URLs mẫu
    const sampleAudioUrls = [
      'https://example.com/audio/podcast-1.mp3',
      'https://example.com/audio/podcast-2.mp3',
      'https://example.com/audio/interview.mp3',
      'https://example.com/audio/talk-show.mp3',
      'https://example.com/audio/discussion.mp3',
      'https://example.com/audio/episode.mp3',
    ];

    // Cover images mẫu
    const sampleCoverImages = [
      'https://picsum.photos/800/450?random=1',
      'https://picsum.photos/800/450?random=2',
      'https://picsum.photos/800/450?random=3',
      'https://picsum.photos/800/450?random=4',
      'https://picsum.photos/800/450?random=5',
      'https://picsum.photos/800/450?random=6',
      'https://picsum.photos/800/450?random=7',
      'https://picsum.photos/800/450?random=8',
    ];
    
    for (let i = 0; i < 30; i++) {
      const title = postTitles[i] || `Bài viết số ${i + 1}`;
      const slug = this.generateSlug(title);
      const status = statuses[i % statuses.length];
      const isFeatured = i < 5; // First 5 posts are featured
      const isPinned = i < 3; // First 3 posts are pinned
      
      // Xác định loại bài viết
      let postType: PostType = PostType.TEXT;
      let videoUrl: string | null = null;
      let audioUrl: string | null = null;
      let coverImage: string | null = null;

      if (videoPostIndices.includes(i)) {
        postType = PostType.VIDEO;
        videoUrl = sampleVideoUrls[videoPostIndices.indexOf(i) % sampleVideoUrls.length];
        coverImage = sampleCoverImages[i % sampleCoverImages.length];
      } else if (audioPostIndices.includes(i)) {
        postType = PostType.AUDIO;
        audioUrl = sampleAudioUrls[audioPostIndices.indexOf(i) % sampleAudioUrls.length];
        coverImage = sampleCoverImages[i % sampleCoverImages.length];
      } else if (imagePostIndices.includes(i)) {
        postType = PostType.IMAGE;
        coverImage = sampleCoverImages[i % sampleCoverImages.length];
      }
      
      // Random user
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      
      // Random 1-3 categories
      const numCategories = Math.floor(Math.random() * 3) + 1;
      const shuffledCategories = [...allCategories].sort(() => 0.5 - Math.random());
      const postCategories = shuffledCategories.slice(0, numCategories);
      const primaryCategory = postCategories[0];
      
      // Random 2-5 tags
      const numTags = Math.floor(Math.random() * 4) + 2;
      const shuffledTags = [...allTags].sort(() => 0.5 - Math.random());
      const postTags = shuffledTags.slice(0, numTags);
      
      // Published date (if published)
      const publishedAt = status === PostStatus.PUBLISHED
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        : null;
      
      const post = postRepo.create({
        name: title,
        slug: slug,
        excerpt: `Đây là phần tóm tắt của bài viết "${title}". Bài viết này sẽ cung cấp những thông tin hữu ích về chủ đề liên quan.`,
        content: this.generateContent(title, postType),
        post_type: postType,
        video_url: videoUrl,
        audio_url: audioUrl,
        cover_image: coverImage,
        status: status,
        is_featured: isFeatured,
        is_pinned: isPinned,
        published_at: publishedAt,
        view_count: Math.floor(Math.random() * 10000),
        primary_postcategory_id: primaryCategory?.id,
        created_user_id: randomUser.id,
        categories: postCategories,
        tags: postTags,
      });

      const saved = await postRepo.save(post);
      this.logger.log(`Created post: ${title} (${postType}, ${status}, categories: ${postCategories.length}, tags: ${postTags.length})`);
    }

    this.logger.log('Posts seeding completed - Total: 30');
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateContent(title: string, postType: PostType = PostType.TEXT): string {
    let content = `
      <h1>${title}</h1>
      <p>Đây là nội dung chi tiết của bài viết về chủ đề "${title}".</p>
    `;

    if (postType === PostType.VIDEO) {
      content += `
      <h2>Video hướng dẫn</h2>
      <p>Video này sẽ hướng dẫn bạn chi tiết về chủ đề "${title}". Hãy xem video để hiểu rõ hơn về các khái niệm và kỹ thuật được trình bày.</p>
      <h2>Nội dung video</h2>
      <p>Video bao gồm các phần chính:</p>
      <ul>
        <li>Giới thiệu và tổng quan</li>
        <li>Hướng dẫn từng bước chi tiết</li>
        <li>Ví dụ thực tế và best practices</li>
        <li>Q&A và troubleshooting</li>
      </ul>
      <h2>Kết luận</h2>
      <p>Hy vọng video này đã cung cấp cho bạn những thông tin hữu ích. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại để lại comment bên dưới.</p>
      `;
    } else if (postType === PostType.AUDIO) {
      content += `
      <h2>Podcast / Audio</h2>
      <p>Audio này sẽ thảo luận chi tiết về chủ đề "${title}". Hãy nghe audio để hiểu rõ hơn về các khái niệm và quan điểm được trình bày.</p>
      <h2>Nội dung audio</h2>
      <p>Audio bao gồm các phần chính:</p>
      <ul>
        <li>Giới thiệu chủ đề</li>
        <li>Thảo luận chi tiết</li>
        <li>Ví dụ và case studies</li>
        <li>Tổng kết và takeaways</li>
      </ul>
      <h2>Kết luận</h2>
      <p>Hy vọng audio này đã cung cấp cho bạn những thông tin hữu ích. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại để lại comment bên dưới.</p>
      `;
    } else if (postType === PostType.IMAGE) {
      content += `
      <h2>Gallery hình ảnh</h2>
      <p>Bài viết này bao gồm một bộ sưu tập hình ảnh về chủ đề "${title}". Hãy xem các hình ảnh để hiểu rõ hơn về các khái niệm và ví dụ được trình bày.</p>
      <h2>Nội dung hình ảnh</h2>
      <p>Gallery bao gồm:</p>
      <ul>
        <li>Hình ảnh minh họa các khái niệm</li>
        <li>Screenshots và ví dụ thực tế</li>
        <li>Diagrams và flowcharts</li>
        <li>Before/After comparisons</li>
      </ul>
      <h2>Kết luận</h2>
      <p>Hy vọng gallery này đã cung cấp cho bạn những thông tin hữu ích. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại để lại comment bên dưới.</p>
      `;
    } else {
      content += `
      <h2>Giới thiệu</h2>
      <p>Trong bài viết này, chúng ta sẽ tìm hiểu về các khía cạnh quan trọng của chủ đề này. Đây là một chủ đề rất thú vị và có nhiều ứng dụng thực tế.</p>
      <h2>Nội dung chính</h2>
      <p>Phần này sẽ trình bày chi tiết về các khái niệm, phương pháp, và kỹ thuật liên quan. Chúng ta sẽ đi sâu vào từng phần để có cái nhìn toàn diện.</p>
      <ul>
        <li>Điểm quan trọng thứ nhất</li>
        <li>Điểm quan trọng thứ hai</li>
        <li>Điểm quan trọng thứ ba</li>
      </ul>
      <h2>Kết luận</h2>
      <p>Hy vọng bài viết này đã cung cấp cho bạn những thông tin hữu ích. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại để lại comment bên dưới.</p>
      `;
    }

    return content.trim();
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing posts...');
    const postRepo = this.dataSource.getRepository(Post);
    
    // Xóa junction tables trước để tránh lỗi duplicate key
    // Sau đó xóa posts (CASCADE sẽ tự động xóa nếu còn sót)
    try {
      await this.dataSource.query('DELETE FROM post_posttag');
      this.logger.log('Cleared post_posttag junction table');
    } catch (error) {
      this.logger.warn('Could not clear post_posttag (may not exist):', error.message);
    }
    
    try {
      await this.dataSource.query('DELETE FROM post_postcategory');
      this.logger.log('Cleared post_postcategory junction table');
    } catch (error) {
      this.logger.warn('Could not clear post_postcategory (may not exist):', error.message);
    }
    
    // Xóa tất cả posts
    const allPosts = await postRepo.find();
    if (allPosts.length > 0) {
      await postRepo.remove(allPosts);
      this.logger.log(`Cleared ${allPosts.length} posts`);
    } else {
      this.logger.log('No posts to clear');
    }
    
    this.logger.log('Posts cleared successfully');
  }
}

