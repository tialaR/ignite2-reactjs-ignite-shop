import Image from "next/image"
import { GetServerSideProps, GetStaticProps } from "next"
import Head from 'next/head'

import { useKeenSlider } from 'keen-slider/react'

import { stripe } from "../lib/stripe"
import { HomeContainer, Product } from "../styles/pages/home"

import 'keen-slider/keen-slider.min.css'
import Stripe from "stripe"
import Link from "next/link"

interface HomeProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: string
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48
    }
  });

  /*
    ref={sliderRef} -> Da acesso ao KeenSlider modificar a tag <HomeContainer />
    diretamente pelo JS.
    className="keen-slider" -> Para a estilização funcionar do container eu preciso passar
    alguma classe
    className="keen-slider__slide" -> Para a estilização do item funcionar eu preciso passar
    alguma classe
  */

    console.log(products);

    return (
      <>
        <Head>
          <title>Home | Ignite Shop</title>
        </Head>

        <HomeContainer ref={sliderRef} className="keen-slider">
          {products.map(product => {
            return (
              <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
                <Product
                  className="keen-slider__slide"
                >
                  <Image src={product.imageUrl} width={520} height={480} alt="" />

                  <footer>
                    <strong>{product.name}</strong>
                    <span>{product.price}</span>
                  </footer>
                </Product>
              </Link>
            )
          })}
        </HomeContainer>
      </>
  )
  }

  /*
    A Home é uma página estática onde não recebe nenhum tipo de parâmetro,
     ou seja, ele é smepre igual.
  */
  export const getStaticProps: GetStaticProps = async () => {
    const response = await stripe.products.list({
      expand: ['data.default_price']
    });  
  
    const products = response.data.map(product => {
      const price = product.default_price as Stripe.Price;
  
      return {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0] ?? '',
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount ? price.unit_amount / 100 : 0),
      }
    })
  
    return {
      props: {
        products
      }
    }
  }