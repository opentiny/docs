import { useData, useRoute } from 'vitepress'

interface TabItem {
  key: string
  name: string
  link: string
}

interface configNavItem {
  text: string
  link: string
  activeMatch?: string
}


type NavTabConstructor = new (
  activeProductTab: string,
  site: any,
  themeConfig?: any
) => NavTab

class NavTab {
  activeProductTab: string
  site: any
  themeConfig?: any

  constructor(activeProductTab: string, site: any, themeConfig?: any) {
    this.activeProductTab = activeProductTab
    this.site = site
    this.themeConfig = themeConfig
  }

  getConfigKey(link: any) {
    return link.replace(/\/$/, '').split('/')[2]
  }

  getTabs(): TabItem[] {
    const prefix = this.site.value.base || '/'
    const { nav } = this.themeConfig

    return (
      (nav || []).map((item: configNavItem) => ({
        key: this.getConfigKey(item.link) || item.text.toLowerCase().replace(/\s+/g, '-'),
        name: item.text,
        link: `${prefix}${item.link.slice(1)}`,
        disabled: false
      })) || []
    )
  }
}

class NextSdkNavTab extends NavTab {
  constructor(activeProductTab: string, site: any, themeConfig?: any) {
    super(activeProductTab, site, themeConfig)
  }

  getTabs(): TabItem[] {
    return [{ key: 'guide', name: '使用文档', link: '/next-sdk/guide/' }]
  }
}

class TinyVueNavTab extends NavTab {
  constructor(activeProductTab: string, site: any, themeConfig?: any) {
    super(activeProductTab, site, themeConfig)
  }

  getTabs(): TabItem[] {
    return [{ key: 'guide', name: '使用文档', link: '/tiny-vue/guide/introduce' }]
  }
}

class TinyEngineNavTab extends NavTab {
  constructor(activeProductTab: string, site: any, themeConfig?: any) {
    super(activeProductTab, site, themeConfig)
  }

  getTabs(): TabItem[] {
    const prefix = this.site.value.base || '/'
    const { engineNav } = this.themeConfig

    return (
      (engineNav || []).map((item: configNavItem) => ({
        key: this.getConfigKey(item.link) || item.text.toLowerCase().replace(/\s+/g, '-'),
        name: item.text,
        link: `${prefix}${item.link.slice(1)}`,
        disabled: false
      })) || []
    )
  }
}

class GenuiSdkNavTab extends NavTab {
  constructor(activeProductTab: string, site: any, themeConfig?: any) {
    super(activeProductTab, site, themeConfig)
  }

  getTabs(): TabItem[] {
    return [{ key: 'guide', name: '使用文档', link: '/genui-sdk/guide/index' }]
  }
}

const navTabClassMap: Record<string, NavTabConstructor> = {
  'next-sdk': NextSdkNavTab,
  'tiny-vue': TinyVueNavTab,
  'tiny-engine': TinyEngineNavTab,
  'genui-sdk': GenuiSdkNavTab,
}

const navPathMap: Record<string, string> = {
  'next-sdk': '/next-sdk/',
  'tiny-vue': '/tiny-vue/',
  'tiny-engine': '/tiny-engine/',
  'genui-sdk': '/genui-sdk/',
}

const NavTabFactory = (activeProductTab: string, route: any, site: any, themeConfig: any) => {
  const isCurrentPath = (path: string) => route.path.includes(path)

  const navPath = navPathMap[activeProductTab]
  const NavTabClass = navTabClassMap[activeProductTab]

  if (NavTabClass && isCurrentPath(navPath)) {
    return new NavTabClass(activeProductTab, site, themeConfig)
  }

  return new NavTab(activeProductTab, site, themeConfig)
}

export { NavTabFactory }
