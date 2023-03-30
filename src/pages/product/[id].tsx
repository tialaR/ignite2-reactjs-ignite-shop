import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next"
import Image from "next/image";
import { useState } from "react";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product"
import Head from 'next/head'

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  /* Como o REDIRECT demora um pouco de ocorrer uma BOA PRÁTICA é criar um estado
  para mostrar para o usuário que a ação de checkout está em progresso */
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);

  async function handleBuyButton() {
    try {
      setIsCreatingCheckoutSession(true);

      // CRIANDO CHECKOUT SESSSION
      /* Como a api (nesse caso o stripe) roda no mesmo endereço front-end 
        (tanto a api quanto o front end então rodando no localhost:3000 basta 
        colocar o camiho da rota ex: /api/checkout → pasta/arquivo só tirando 
        o localhost:3000 → tirando a parte do domínio que a aplicação vai 
        conseguir se comunicar porque ele usa da mesma base de endereço/mesma 
        base de url do front) */
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId, //params que quero enviar p/ rota /api/checkout
      })

      /* checkoutUrl -> é a prop devolvida pela rota /api/checkout quando o status 
        code for 201, ou seja, quando der sucesso */
      const { checkoutUrl } = response.data;

      /* -> Redireciona o usuário para a "checkoutUrl" -> Rota externa devolvida 
            quando da sucesso na requisição. É uma rota externa porque o "stripe" não é uma aplicação
            nossa e por isso eu uso o object "window".
        ->  Caso eu quisesse redirecionar o usuário para uma rota interna de nossa aplicação
            eu posso usar o hook do next chamado useRouter() chamando o router.push("/checkout")
            por exemplo para realizar tal ação.
        */
      window.location.href = checkoutUrl;
    } catch (err) {
      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button disabled={isCreatingCheckoutSession} onClick={handleBuyButton}>
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_NbQpMR5t5gu0sx' } },
    ],
    fallback: 'blocking',
  }
}

/*
  Diferente da página Home onde a mesma é uma  página estática onde não recebe 
  nenhum tipo de parâmetro, ou seja, ele é smepre igual.

  Na página de um produto específico, como é esse caso ela também é uma página estática
  mas que tem que mudar de acordo com o produto. Não adiantando gerar uma única 
  página estática porque eu preciso na verdade gerar uma página estática por produto.
*/
export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  //Recuperando o id que foi passado por parâmetro via rota /product/:id

  if(!params) {
    return {
      notFound: true // Caso não exista parametros, retorna um 404
    }
  }
  
  const productId = params.id;

  /* Buscando dados do produto específico a partir do Id que foi 
    passado por parâmetro via rota /product/:id */
  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(price.unit_amount ? price.unit_amount / 100 : 0),
        description: product.description,
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1 // 1 hours
  }
}