import { CheckoutCompleteDocument, TransactionProcessDocument } from "@/generated/graphql";
import { getCheckoutFromCookiesOrRedirect } from "@/lib/app-router";
import { executeGraphQL } from "@/lib/common";
import { notFound } from "next/navigation";

export default async function CartSuccessPage({
	params,
	searchParams,
}: {
	params: { transactionId: string };
	searchParams: { authorization_token: string | undefined };
}) {
	const checkout = await getCheckoutFromCookiesOrRedirect();

	if (!params.transactionId) {
		notFound();
	}

	const transactionId = decodeURIComponent(params.transactionId);

	if (!searchParams.authorization_token) {
		throw new Error("Authorization token is missing");
	}

	await executeGraphQL({
		query: TransactionProcessDocument,
		variables: {
			transactionId,
			data: {
				authorizationToken: searchParams.authorization_token,
			},
		},
		cache: "no-store",
	});

	const data = await executeGraphQL({
		query: CheckoutCompleteDocument,
		variables: {
			checkoutId: checkout.id,
		},
	});

	const order = data.checkoutComplete?.order;

	if (!order) {
		notFound();
	}

	return (
		<article>
			<h1 className="text-5xl">Order #{order.id} created!</h1>
		</article>
	);
}
