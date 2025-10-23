import { MainLayout } from "@/components/MainLayout";
import { appInfo } from "@/lib/app-info";
import { addPolyfills } from "@/lib/polyfills";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

addPolyfills();

export default function App({ Component, pageProps }: AppProps) {

    useEffect(()=>{
        import('@/lib/frontendModule').then(m=>{
            m.initFrontend();
        });
    },[]);
    
    return (
        <>
            <Head>
                <title>{appInfo.title}</title>
                <meta key="head:description" name="description" content={appInfo.description}/>
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
                <link rel="icon" href="/favicon.png" />
                <meta key="head:og:title" property="og:title" content={appInfo.title} />
                <meta key="head:og:description" property="og:description" content={appInfo.description} />
                <meta key="head:og:type" property="og:type" content="website" />
                <meta key="head:og:image" property="og:image" content={`${process.env['NEXT_PUBLIC_HTTP_PROTOCOL']}://${process.env['NEXT_PUBLIC_FRONTEND_DOMAIN']}/opengraph.jpg`} />
                <meta key="head:og:url" property="og:url" content={`${process.env['NEXT_PUBLIC_HTTP_PROTOCOL']}://${process.env['NEXT_PUBLIC_FRONTEND_DOMAIN']}/`} />
            </Head>
            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
        </>
    )
}
