import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
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

const ResourceCard = ({ resource, onOpen, onDelete, isOpening }) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isLink = resource.kind === 'link';
  const { Icon, color } = isLink
    ? getLinkTypeInfo(resource.url)
    : getFileTypeInfo(resource.type, resource.name);
  const typeLabel = getTypeLabel(resource);

  const subtitle = isLink
    ? (resource.url.length > 42 ? resource.url.slice(0, 42) + '…' : resource.url)
    : formatFileSize(resource.size);

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        height: 190,
        width: '100%',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <CardContent sx={{
        p: 1.75,
        '&:last-child': { pb: 1.75 },
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}20`,
              color: color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box
            sx={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: 0.5,
              color: color,
              bgcolor: `${color}15`,
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              border: `1px solid ${color}40`,
            }}
          >
            {typeLabel}
          </Box>
        </Box>

        <Tooltip title={resource.name} arrow placement="top">
          <Typography
            variant="body2"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              minHeight: '2.3em',
            }}
          >
            {resource.name}
          </Typography>
        </Tooltip>

        <Box sx={{ mt: 1, flex: 1, minHeight: 0 }}>
          <Tooltip title={isLink ? resource.url : ''} arrow>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{
                display: 'block',
                fontSize: '0.68rem',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </Typography>
          </Tooltip>
          <Typography
            variant="caption"
            color="text.secondary"
            component="div"
            sx={{ display: 'block', fontSize: '0.68rem', lineHeight: 1.4 }}
          >
            Added {formatDate(resource.uploadedAt)}
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 0.5,
          pt: 0.75,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}>
          <Tooltip title={isLink ? 'Open link' : 'Open file'} arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onOpen(resource)}
                disabled={isOpening}
                aria-label={isLink ? `Open ${resource.name}` : `Open file ${resource.name}`}
                sx={{
                  color: 'primary.main',
                  p: 0.5,
                  '&:focus-visible': {
                    outline: `2px solid currentColor`,
                    outlineOffset: 2,
                  },
                }}
              >
                {isOpening ? <CircularProgress size={16} /> : <OpenIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(resource)}
              aria-label={`Remove ${resource.name}`}
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:focus-visible': {
                  outline: `2px solid currentColor`,
                  outlineOffset: 2,
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;