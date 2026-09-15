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
} from '@mui/icons-material';
import { formatFileSize } from '../../services/resource.service';

// Reuse the same logic as ResourceCard
const getFileTypeInfo = (type, name) => {
  const fileName = (name || '').toLowerCase();
  const ext = fileName.split('.').pop();

  if (type) {
    if (type === 'application/pdf') return { Icon: PdfIcon, color: '#dc3545' };
    if (type.includes('word') || type.includes('document')) return { Icon: WordIcon, color: '#2b579a' };
    if (type.includes('excel') || type.includes('spreadsheet') || type === 'text/csv') return { Icon: ExcelIcon, color: '#217346' };
    if (type.includes('powerpoint') || type.includes('presentation')) return { Icon: PowerPointIcon, color: '#d24726' };
    if (type === 'application/json') return { Icon: JsonIcon, color: '#fbc02d' };
    if (type === 'text/html') return { Icon: HtmlIcon, color: '#e34c26' };
    if (type.startsWith('image/')) return { Icon: ImageIcon, color: '#0d6efd' };
    if (type.startsWith('video/')) return { Icon: VideoIcon, color: '#6f42c1' };
    if (type.startsWith('audio/')) return { Icon: AudioIcon, color: '#e83e8c' };
    if (type.includes('zip') || type.includes('compressed') || type.includes('tar')) return { Icon: ArchiveIcon, color: '#6c757d' };
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
    htm: { Icon: HtmlIcon, color: '#e34c26' },
    js: { Icon: CodeIcon, color: '#f7df1e' },
    jsx: { Icon: CodeIcon, color: '#61dafb' },
    ts: { Icon: CodeIcon, color: '#3178c6' },
    tsx: { Icon: CodeIcon, color: '#61dafb' },
    java: { Icon: CodeIcon, color: '#f89820' },
    py: { Icon: CodeIcon, color: '#3776ab' },
    rb: { Icon: CodeIcon, color: '#cc342d' },
    go: { Icon: CodeIcon, color: '#00add8' },
    rs: { Icon: CodeIcon, color: '#dea584' },
    c: { Icon: CodeIcon, color: '#555555' },
    cpp: { Icon: CodeIcon, color: '#00599c' },
    h: { Icon: CodeIcon, color: '#555555' },
    cs: { Icon: CodeIcon, color: '#239120' },
    php: { Icon: CodeIcon, color: '#777bb4' },
    css: { Icon: CodeIcon, color: '#264de4' },
    scss: { Icon: CodeIcon, color: '#cd6799' },
    xml: { Icon: CodeIcon, color: '#ff6600' },
    md: { Icon: TextIcon, color: '#083fa1' },
    txt: { Icon: TextIcon, color: '#20c997' },
    log: { Icon: TextIcon, color: '#20c997' },
    png: { Icon: ImageIcon, color: '#0d6efd' },
    jpg: { Icon: ImageIcon, color: '#0d6efd' },
    jpeg: { Icon: ImageIcon, color: '#0d6efd' },
    gif: { Icon: ImageIcon, color: '#0d6efd' },
    svg: { Icon: ImageIcon, color: '#0d6efd' },
    webp: { Icon: ImageIcon, color: '#0d6efd' },
    bmp: { Icon: ImageIcon, color: '#0d6efd' },
    ico: { Icon: ImageIcon, color: '#0d6efd' },
    mp4: { Icon: VideoIcon, color: '#6f42c1' },
    mov: { Icon: VideoIcon, color: '#6f42c1' },
    avi: { Icon: VideoIcon, color: '#6f42c1' },
    mkv: { Icon: VideoIcon, color: '#6f42c1' },
    webm: { Icon: VideoIcon, color: '#6f42c1' },
    mp3: { Icon: AudioIcon, color: '#e83e8c' },
    wav: { Icon: AudioIcon, color: '#e83e8c' },
    ogg: { Icon: AudioIcon, color: '#e83e8c' },
    flac: { Icon: AudioIcon, color: '#e83e8c' },
    zip: { Icon: ArchiveIcon, color: '#6c757d' },
    rar: { Icon: ArchiveIcon, color: '#6c757d' },
    '7z': { Icon: ArchiveIcon, color: '#6c757d' },
    tar: { Icon: ArchiveIcon, color: '#6c757d' },
    gz: { Icon: ArchiveIcon, color: '#6c757d' },
  };

  if (extMap[ext]) return extMap[ext];

  return { Icon: FileIcon, color: '#6c757d' };
};

const ResourceTableRow = ({ resource, onOpen, onDelete, isOpening }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const { Icon, color } = getFileTypeInfo(resource.type, resource.name);

  return (
    <TableRow
      hover
      sx={{
        '&:last-child td': { border: 0 },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}20`,
              color: color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Tooltip title={resource.name} arrow>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.85rem',
                maxWidth: 280,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {resource.name}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {resource.type || 'Unknown'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          {formatFileSize(resource.size)}
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
          <Tooltip title="Open file" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onOpen(resource)}
                disabled={isOpening}
                sx={{ color: 'primary.main' }}
              >
                {isOpening ? (
                  <CircularProgress size={16} />
                ) : (
                  <OpenIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove reference" arrow>
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