import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
}

@Injectable()
export class UploadService {
  private supabase: SupabaseClient | null = null;
  private bucket: string;
  private mockStorage: boolean;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    this.bucket = this.configService.get<string>('SUPABASE_BUCKET', 'uploads');
    this.mockStorage = this.configService.get<string>('MOCK_STORAGE') === 'true';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResult> {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${filename}`;

    // Mock storage mode for local development
    if (this.mockStorage) {
      return {
        url: `http://localhost:3000/mock-uploads/${path}`,
        path,
        filename: file.originalname,
      };
    }

    if (!this.supabase) {
      throw new BadRequestException('Storage not configured. Set MOCK_STORAGE=true for local development.');
    }

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path,
      filename: file.originalname,
    };
  }

  async uploadImages(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<UploadResult[]> {
    const MAX_FILES = 3;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
    const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB total

    if (files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > MAX_FILES) {
      throw new BadRequestException(`Maximum ${MAX_FILES} images allowed`);
    }

    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    let totalSize = 0;

    for (const file of files) {
      if (!imageTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.originalname}. Only images are allowed.`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(`File ${file.originalname} exceeds 5MB limit`);
      }
      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      throw new BadRequestException('Total file size exceeds 15MB limit');
    }

    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await this.uploadSingleImage(file, userId);
      results.push(result);
    }

    return results;
  }

  private async uploadSingleImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResult> {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/images/${filename}`;

    if (this.mockStorage) {
      return {
        url: `http://localhost:3000/mock-uploads/${path}`,
        path,
        filename: file.originalname,
      };
    }

    if (!this.supabase) {
      throw new BadRequestException('Storage not configured. Set MOCK_STORAGE=true for local development.');
    }

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path,
      filename: file.originalname,
    };
  }

  async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Percepta/1.0)',
        },
      });

      const html = response.data;

      // Simple HTML parsing to extract text content
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

      // Remove scripts, styles, and HTML tags
      let content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Limit content length
      const maxLength = 50000;
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '...';
      }

      return {
        title,
        content,
        url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Failed to fetch URL: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
