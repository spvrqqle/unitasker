import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
  PictureAsPdf as PdfIcon,
  Description as WordIcon,
  TableChart as ExcelIcon,
  Slideshow as PowerPointIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  InsertDriveFile as FileIcon,
  TextSnippet as TextIcon,
  Html as HtmlIcon,
  DataObject as JsonIcon,
  Link as LinkIcon,
  Cloud as CloudIcon,
  GitHub as GitHubIcon,
  PlayCircle as YouTubeIcon,
  Folder as PathIcon,
} from '@mui/icons-material';
import { formatFileSize, getTypeLabel } from '../../services/resource.service';

const getFileTypeInfo = (type, name) => {
  const ext = (name || '').toLowerCase().split('.').pop();
  if (type) {
    if (type === 'application/pdf') return { Icon: PdfIcon, color: '#dc3545' };
    if (type.includes('word')) return { Icon: WordIcon, color: '#2b579a' };
    if (type.includes('excel') || type.includes('spreadsheet') || type === 'text/csv') return { Icon: ExcelIcon, color: '#217346' };
    if (type.includes('powerpoint')) return { Icon: PowerPointIcon, color: '#d24726' };
    if (type === 'application/json') return { Icon: JsonIcon, color: '#fbc02d' };
    if (type === 'text/html') return { Icon: HtmlIcon, color: '#e34c26' };
    if (type.startsWith('image/')) return { Icon: ImageIcon, color: '#0d6efd' };
    if (type.startsWith('video/')) return { Icon: VideoIcon, color: '#6f42c1' };
    if (type.startsWith('audio/')) return { Icon: AudioIcon, color: '#e83e8c' };
    if (type.includes('zip')) return { Icon: ArchiveIcon, color: '#6c757d' };
    if (type.startsWith('text/')) return { Icon: TextIcon, color: '#20c997' };
  }
  const extMap = {
    pdf: { Icon: PdfIcon, color: '#dc3545' },
    doc: { Icon: WordIcon, color: '#2b579a' },
    docx: { Icon: WordIcon, color: '#2b579a' },
    xls: { Icon: ExcelIcon, color: '#217346' },
    xlsx: { Icon: ExcelIcon, color: '#217346' },
    csv: { Icon: ExcelIcon, color: '#217346' },
    ppt: { Icon: PowerPointIcon, color: '#d24726' },
    pptx: { Icon: PowerPointIcon, color: '#d24726' },
    json: { Icon: JsonIcon, color: '#fbc02d' },
    html: { Icon: HtmlIcon, color: '#e34c26' },
    js: { Icon: CodeIcon, color: '#f7df1e' },
    jsx: { Icon: CodeIcon, color: '#61dafb' },
    ts: { Icon: CodeIcon, color: '#3178c6' },
    tsx: { Icon: CodeIcon, color: '#61dafb' },
    java: { Icon: CodeIcon, color: '#f89820' },
    py: { Icon: CodeIcon, color: '#3776ab' },
    css: { Icon: CodeIcon, color: '#264de4' },
    md: { Icon: TextIcon, color: '#083fa1' },
    txt: { Icon: TextIcon, color: '#20c997' },
    png: { Icon: ImageIcon, color: '#0d6efd' },
    jpg: { Icon: ImageIcon, color: '#0d6efd' },
    jpeg: { Icon: ImageIcon, color: '#0d6efd' },
    gif: { Icon: ImageIcon, color: '#0d6efd' },
    svg: { Icon: ImageIcon, color: '#0d6efd' },
    mp4: { Icon: VideoIcon, color: '#6f42c1' },
    mp3: { Icon: AudioIcon, color: '#e83e8c' },
    zip: { Icon: ArchiveIcon, color: '#6c757d' },
  };
  if (extMap[ext]) return extMap[ext];
  return { Icon: FileIcon, color: '#6c757d' };
};

const getLinkTypeInfo = (url) => {
  if (!url) return { Icon: LinkIcon, color: '#6ea8fe' };
  if (/drive\.google/i.test(url)) return { Icon: CloudIcon, color: '#1a73e8' };
  if (/onedrive|1drv\.ms/i.test(url)) return { Icon: CloudIcon, color: '#0078d4' };
  if (/dropbox/i.test(url)) return { Icon: CloudIcon, color: '#0061ff' };
  if (/github/i.test(url)) return { Icon: GitHubIcon, color: '#e9ecef' };
  if (/youtube|youtu\.be/i.test(url)) return { Icon: YouTubeIcon, color: '#ff0000' };
  if (/^[a-z]:\\/i.test(url) || url.startsWith('/')) return { Icon: PathIcon, color: '#ffa726' };
  return { Icon: LinkIcon, color: '#6ea8fe' };
};

const ResourceTableRow = ({ resource, onOpen, onDelete, isOpening }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const isLink = resource.kind === 'link';
  const { Icon, color } = isLink
    ? getLinkTypeInfo(resource.url)
    : getFileTypeInfo(resource.type, resource.name);
  const typeLabel = getTypeLabel(resource);

  return (
    <TableRow hover sx={{ '&:last-child td': { border: 0 } }}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${color}20`, color: color, flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Tooltip title={resource.name} arrow>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500, fontSize: '0.85rem', maxWidth: 280,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {resource.name}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
          {typeLabel}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          {isLink ? '—' : formatFileSize(resource.size)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {formatDate(resource.uploadedAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {formatDate(resource.lastAccessed)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title={isLink ? 'Open link' : 'Open file'} arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onOpen(resource)}
                disabled={isOpening}
                sx={{ color: 'primary.main' }}
              >
                {isOpening ? <CircularProgress size={16} /> : <OpenIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(resource)}
              sx={{ color: 'text.secondary' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ResourceTableRow;