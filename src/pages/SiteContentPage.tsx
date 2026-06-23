import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import UploadRoundedIcon from '@mui/icons-material/UploadRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import PageToolbar from '@/components/layout/PageToolbar'
import { siteContentService, type HomePageContent } from '@/api'

const HOME_PAGE_KEY = 'home'

const defaultHomeContent: HomePageContent = {
  hero: {
    title: '農場直送的真實新鮮',
    description: '精選在地小農合作，當日採收、當日出貨。每一口都來自看得見的土地，為你保留蔬果最純粹的味道。',
    button_text: '立即預訂',
    button_link: '/mekarang/products',
    image_url: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?auto=format&fit=crop&w=1800&q=80',
  },
  showcase_blocks: [
    {
      title: '友善耕作，季節直送',
      description: '挑選當季最鮮甜的蔬果，由合作農場每日採收。從田間到餐桌，每一份都保留自然風味與安心履歷。',
      image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=80',
    },
    {
      title: '品質把關，全程透明',
      description: '每批產品皆經過分級與包裝檢驗，提供清楚來源與保存建議，讓你可以輕鬆選購、放心食用。',
      image_url: 'https://picsum.photos/id/684/600/400?auto=format&fit=crop&w=1800&q=80',
    },
  ],
  flow: {
    title: '從下單到餐桌的三步驟',
    items: [
      { title: '訂購', description: '線上快速選購，依需求挑選蔬果組合與配送時段。' },
      { title: '打包', description: '採收後即刻分類與低溫包裝，完整保留新鮮口感。' },
      { title: '到府', description: '冷鏈配送準時送達，讓每日料理都能輕鬆上桌。' },
    ],
  },
  bottom_cta: {
    title: '現在訂購，享受當季直送',
    description: '每週更新當季蔬果清單，提供單次購買與定期配送。把採收時刻的清甜，準時送到你的廚房。',
    button_text: '立即開始',
    button_link: '/mekarang/products',
    image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=80',
  },
  mekarang: {
    banner_image_url: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1800&q=80',
  },
  orders_query: {
    description: '輸入你的訂單編號與 Email，立即查看付款狀態、配送進度與收件資訊。若你剛完成下單，也可以在這裡快速追蹤最新處理狀態。',
    image_url: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?auto=format&fit=crop&w=1800&q=80',
  },
  footer: {
    title: '與我們保持聯繫',
    button_text: '開始選購',
    description: '分享料理靈感、農場日常與最新檔期。追蹤我們，第一時間收到新品上市與優惠資訊。',
    social_links: {
      facebook: '',
      instagram: '',
      youtube: '',
    },
  },
}

const cloneDefaultContent = () => JSON.parse(JSON.stringify(defaultHomeContent)) as HomePageContent

const ensureHomeContent = (input: unknown): HomePageContent => {
  const fallback = cloneDefaultContent()
  if (!input || typeof input !== 'object') {
    return fallback
  }

  const raw = input as Partial<HomePageContent>
  const showcaseBlocks = Array.isArray(raw.showcase_blocks) ? raw.showcase_blocks.slice(0, 2) : []
  const flowItems = Array.isArray(raw.flow?.items) ? raw.flow.items.slice(0, 3) : []

  while (showcaseBlocks.length < 2) {
    showcaseBlocks.push(fallback.showcase_blocks[showcaseBlocks.length])
  }

  while (flowItems.length < 3) {
    flowItems.push(fallback.flow.items[flowItems.length])
  }

  return {
    hero: {
      title: raw.hero?.title ?? fallback.hero.title,
      description: raw.hero?.description ?? fallback.hero.description,
      button_text: raw.hero?.button_text ?? fallback.hero.button_text,
      button_link: raw.hero?.button_link ?? fallback.hero.button_link,
      image_url: raw.hero?.image_url ?? fallback.hero.image_url,
    },
    showcase_blocks: showcaseBlocks.map((item, index) => ({
      title: item?.title ?? fallback.showcase_blocks[index].title,
      description: item?.description ?? fallback.showcase_blocks[index].description,
      image_url: item?.image_url ?? fallback.showcase_blocks[index].image_url,
    })),
    flow: {
      title: raw.flow?.title ?? fallback.flow.title,
      items: flowItems.map((item, index) => ({
        title: item?.title ?? fallback.flow.items[index].title,
        description: item?.description ?? fallback.flow.items[index].description,
      })),
    },
    bottom_cta: {
      title: raw.bottom_cta?.title ?? fallback.bottom_cta.title,
      description: raw.bottom_cta?.description ?? fallback.bottom_cta.description,
      button_text: raw.bottom_cta?.button_text ?? fallback.bottom_cta.button_text,
      button_link: raw.bottom_cta?.button_link ?? fallback.bottom_cta.button_link,
      image_url: raw.bottom_cta?.image_url ?? fallback.bottom_cta.image_url,
    },
    mekarang: {
      banner_image_url: raw.mekarang?.banner_image_url ?? fallback.mekarang.banner_image_url,
    },
    orders_query: {
      description: raw.orders_query?.description ?? fallback.orders_query.description,
      image_url: raw.orders_query?.image_url ?? fallback.orders_query.image_url,
    },
    footer: {
      title: raw.footer?.title ?? fallback.footer.title,
      button_text: raw.footer?.button_text ?? fallback.footer.button_text,
      description: raw.footer?.description ?? fallback.footer.description,
      social_links: {
        facebook: raw.footer?.social_links?.facebook ?? fallback.footer.social_links.facebook,
        instagram: raw.footer?.social_links?.instagram ?? fallback.footer.social_links.instagram,
        youtube: raw.footer?.social_links?.youtube ?? fallback.footer.social_links.youtube,
      },
    },
  }
}

const SiteContentPage = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [uploadingKey, setUploadingKey] = useState('')
  const [content, setContent] = useState<HomePageContent>(cloneDefaultContent)

  const loadContent = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await siteContentService.getByPageKey<HomePageContent>(HOME_PAGE_KEY)
      setContent(ensureHomeContent(data.content_data))
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入首頁內容失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadContent()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      await siteContentService.updateByPageKey(HOME_PAGE_KEY, content)
      setNotice('首頁內容已儲存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存首頁內容失敗')
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (assetKey: string, file: File, onSuccess: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案')
      return
    }

    try {
      setUploadingKey(assetKey)
      setError('')
      const uploaded = await siteContentService.uploadAsset(HOME_PAGE_KEY, assetKey, file)
      onSuccess(uploaded.public_url)
      setNotice('圖片上傳成功')
    } catch (err) {
      setError(err instanceof Error ? err.message : '圖片上傳失敗')
    } finally {
      setUploadingKey('')
    }
  }

  const flowItems = useMemo(() => content.flow.items.slice(0, 3), [content.flow.items])

  return (
    <Stack spacing={2}>
      <PageToolbar
        title="首頁內容管理"
        description="管理主圖、說明圖、按鈕文案與 footer 文字。"
        titleIcon={<ImageRoundedIcon color="primary" />}
        onRefresh={() => void loadContent()}
        extraActions={(
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={() => void handleSave()}
            disabled={saving || loading}
          >
            {saving ? '儲存中...' : '儲存內容'}
          </Button>
        )}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? (
        <Alert severity="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      ) : null}

      {loading ? (
        <Paper sx={{ p: 4, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={30} />
        </Paper>
      ) : null}

      {!loading ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">主視覺區塊</Typography>
              <TextField
                label="標題"
                value={content.hero.title}
                onChange={(event) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, title: event.target.value } }))}
                fullWidth
              />
              <TextField
                label="說明"
                value={content.hero.description}
                onChange={(event) =>
                  setContent((prev) => ({ ...prev, hero: { ...prev.hero, description: event.target.value } }))
                }
                multiline
                minRows={3}
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  label="按鈕文字"
                  value={content.hero.button_text}
                  onChange={(event) =>
                    setContent((prev) => ({ ...prev, hero: { ...prev.hero, button_text: event.target.value } }))
                  }
                  fullWidth
                />
                <TextField
                  label="按鈕連結"
                  value={content.hero.button_link}
                  onChange={(event) =>
                    setContent((prev) => ({ ...prev, hero: { ...prev.hero, button_link: event.target.value } }))
                  }
                  fullWidth
                />
              </Stack>
              <TextField
                label="主圖 URL"
                value={content.hero.image_url}
                onChange={(event) => setContent((prev) => ({ ...prev, hero: { ...prev.hero, image_url: event.target.value } }))}
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                  {uploadingKey === 'hero-image' ? '上傳中...' : '上傳主圖'}
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadImage('hero-image', file, (url) => {
                          setContent((prev) => ({ ...prev, hero: { ...prev.hero, image_url: url } }))
                        })
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                </Button>
                <Box
                  component="img"
                  src={content.hero.image_url}
                  alt="hero"
                  sx={{ width: { xs: '100%', md: 280 }, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">說明圖區塊</Typography>
              {content.showcase_blocks.map((block, index) => {
                const imageKey = `showcase-${index + 1}-image`
                return (
                  <Box key={imageKey}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>區塊 {index + 1}</Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="標題"
                          value={block.title}
                          onChange={(event) => {
                            const next = [...content.showcase_blocks]
                            next[index] = { ...next[index], title: event.target.value }
                            setContent((prev) => ({ ...prev, showcase_blocks: next }))
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="圖片 URL"
                          value={block.image_url}
                          onChange={(event) => {
                            const next = [...content.showcase_blocks]
                            next[index] = { ...next[index], image_url: event.target.value }
                            setContent((prev) => ({ ...prev, showcase_blocks: next }))
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          label="說明"
                          value={block.description}
                          onChange={(event) => {
                            const next = [...content.showcase_blocks]
                            next[index] = { ...next[index], description: event.target.value }
                            setContent((prev) => ({ ...prev, showcase_blocks: next }))
                          }}
                          multiline
                          minRows={2}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={12}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                          <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                            {uploadingKey === imageKey ? '上傳中...' : `上傳區塊 ${index + 1} 圖片`}
                            <input
                              hidden
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) {
                                  void uploadImage(imageKey, file, (url) => {
                                    const next = [...content.showcase_blocks]
                                    next[index] = { ...next[index], image_url: url }
                                    setContent((prev) => ({ ...prev, showcase_blocks: next }))
                                  })
                                }
                                event.currentTarget.value = ''
                              }}
                            />
                          </Button>
                          <Box
                            component="img"
                            src={block.image_url}
                            alt={`showcase-${index + 1}`}
                            sx={{ width: { xs: '100%', md: 220 }, height: 96, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                    {index < content.showcase_blocks.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
                  </Box>
                )
              })}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">流程與底部 CTA</Typography>
              <TextField
                label="流程區塊標題"
                value={content.flow.title}
                onChange={(event) => setContent((prev) => ({ ...prev, flow: { ...prev.flow, title: event.target.value } }))}
                fullWidth
              />
              {flowItems.map((item, index) => (
                <Grid container spacing={1.5} key={`flow-item-${index}`}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label={`步驟 ${index + 1} 標題`}
                      value={item.title}
                      onChange={(event) => {
                        const next = [...content.flow.items]
                        next[index] = { ...next[index], title: event.target.value }
                        setContent((prev) => ({ ...prev, flow: { ...prev.flow, items: next } }))
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      label={`步驟 ${index + 1} 說明`}
                      value={item.description}
                      onChange={(event) => {
                        const next = [...content.flow.items]
                        next[index] = { ...next[index], description: event.target.value }
                        setContent((prev) => ({ ...prev, flow: { ...prev.flow, items: next } }))
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              ))}

              <Divider />

              <TextField
                label="底部 CTA 標題"
                value={content.bottom_cta.title}
                onChange={(event) =>
                  setContent((prev) => ({ ...prev, bottom_cta: { ...prev.bottom_cta, title: event.target.value } }))
                }
                fullWidth
              />
              <TextField
                label="底部 CTA 說明"
                value={content.bottom_cta.description}
                onChange={(event) =>
                  setContent((prev) => ({ ...prev, bottom_cta: { ...prev.bottom_cta, description: event.target.value } }))
                }
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  label="底部 CTA 按鈕文字"
                  value={content.bottom_cta.button_text}
                  onChange={(event) =>
                    setContent((prev) => ({ ...prev, bottom_cta: { ...prev.bottom_cta, button_text: event.target.value } }))
                  }
                  fullWidth
                />
                <TextField
                  label="底部 CTA 按鈕連結"
                  value={content.bottom_cta.button_link}
                  onChange={(event) =>
                    setContent((prev) => ({ ...prev, bottom_cta: { ...prev.bottom_cta, button_link: event.target.value } }))
                  }
                  fullWidth
                />
              </Stack>
              <TextField
                label="底部 CTA 背景圖 URL"
                value={content.bottom_cta.image_url}
                onChange={(event) =>
                  setContent((prev) => ({ ...prev, bottom_cta: { ...prev.bottom_cta, image_url: event.target.value } }))
                }
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                  {uploadingKey === 'bottom-cta-image' ? '上傳中...' : '上傳底部 CTA 圖片'}
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadImage('bottom-cta-image', file, (url) => {
                          setContent((prev) => ({ ...prev, bottom_cta: { ...prev.bottom_cta, image_url: url } }))
                        })
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                </Button>
                <Box
                  component="img"
                  src={content.bottom_cta.image_url}
                  alt="bottom-cta"
                  sx={{ width: { xs: '100%', md: 280 }, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">產品/訂購流程頁頂部圖</Typography>
              <Typography variant="body2" color="text.secondary">
                這張圖會同時用在 `/mekarang/products` 與訂購流程相關頁面的頂部 banner。
              </Typography>
              <TextField
                label="頂部 banner 圖片 URL"
                value={content.mekarang.banner_image_url}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    mekarang: { ...prev.mekarang, banner_image_url: event.target.value },
                  }))
                }
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                  {uploadingKey === 'mekarang-banner-image' ? '上傳中...' : '上傳頂部 banner 圖片'}
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadImage('mekarang-banner-image', file, (url) => {
                          setContent((prev) => ({
                            ...prev,
                            mekarang: { ...prev.mekarang, banner_image_url: url },
                          }))
                        })
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                </Button>
                <Box
                  component="img"
                  src={content.mekarang.banner_image_url}
                  alt="mekarang-banner"
                  sx={{ width: { xs: '100%', md: 280 }, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">訂單查詢頁內容</Typography>
              <TextField
                label="查詢頁說明文字"
                value={content.orders_query.description}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    orders_query: { ...prev.orders_query, description: event.target.value },
                  }))
                }
                multiline
                minRows={3}
                fullWidth
              />
              <TextField
                label="右側圖片 URL"
                value={content.orders_query.image_url}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    orders_query: { ...prev.orders_query, image_url: event.target.value },
                  }))
                }
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                  {uploadingKey === 'orders-query-image' ? '上傳中...' : '上傳訂單查詢右側圖片'}
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadImage('orders-query-image', file, (url) => {
                          setContent((prev) => ({
                            ...prev,
                            orders_query: { ...prev.orders_query, image_url: url },
                          }))
                        })
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                </Button>
                <Box
                  component="img"
                  src={content.orders_query.image_url}
                  alt="orders-query-image"
                  sx={{ width: { xs: '100%', md: 280 }, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">Footer 文案</Typography>
              <TextField
                label="Footer 標題"
                value={content.footer.title}
                onChange={(event) =>
                  setContent((prev) => ({ ...prev, footer: { ...prev.footer, title: event.target.value } }))
                }
                fullWidth
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  label="Footer 按鈕文字"
                  value={content.footer.button_text}
                  onChange={(event) =>
                    setContent((prev) => ({ ...prev, footer: { ...prev.footer, button_text: event.target.value } }))
                  }
                  fullWidth
                />
                <TextField
                  label="Footer 描述"
                  value={content.footer.description}
                  onChange={(event) =>
                    setContent((prev) => ({ ...prev, footer: { ...prev.footer, description: event.target.value } }))
                  }
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  label="Facebook 連結（留空不顯示）"
                  value={content.footer.social_links.facebook}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        social_links: { ...prev.footer.social_links, facebook: event.target.value },
                      },
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Instagram 連結（留空不顯示）"
                  value={content.footer.social_links.instagram}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        social_links: { ...prev.footer.social_links, instagram: event.target.value },
                      },
                    }))
                  }
                  fullWidth
                />
              </Stack>
              <TextField
                label="YouTube 連結（留空不顯示）"
                value={content.footer.social_links.youtube}
                onChange={(event) =>
                  setContent((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      social_links: { ...prev.footer.social_links, youtube: event.target.value },
                    },
                  }))
                }
                fullWidth
              />
            </Stack>
          </Paper>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default SiteContentPage
