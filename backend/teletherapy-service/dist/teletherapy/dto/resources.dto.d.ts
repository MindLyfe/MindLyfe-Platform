export declare class FileAccessControlDto {
    allowedUsers: string[];
    password?: string;
    expiresAt?: Date;
}
export declare class FileMetadataDto {
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
    pages?: number;
}
export declare class UploadFileDto {
    fileName: string;
    fileType: string;
    fileSize: number;
    content: string;
    category: string;
    tags: string[];
    accessControl: FileAccessControlDto;
    metadata?: FileMetadataDto;
}
export declare class ResourceLinkDto {
    title: string;
    url: string;
    description?: string;
    category: string;
    tags: string[];
}
export declare class UpdateResourceDto {
    name?: string;
    category?: string;
    tags?: string[];
    accessControl?: FileAccessControlDto;
    metadata?: FileMetadataDto;
}
export declare class ResourceSearchDto {
    query?: string;
    category?: string;
    tags?: string[];
    type?: 'file' | 'link';
    startDate?: Date;
    endDate?: Date;
}
