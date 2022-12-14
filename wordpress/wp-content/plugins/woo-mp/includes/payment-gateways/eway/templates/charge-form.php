<?php defined( 'ABSPATH' ) || die; ?>

<?php $this->template( 'card-fields' ); ?>

<div class="field-row">
    <div class="field-column">
        <label for="card-name">Card Name</label>
        <input type="text" id="card-name" class="field" placeholder="John Smith" data-required data-field-name="cardholder name" />
    </div>
</div>

<?php $this->template( 'charge-amount-field' ); ?>

<!-- Eway requires a form element, but the whole page is in a form, so we need to generate a form element dynamically. -->
<script type="text/template" id="eway-form-template">
    <form action="{{ formActionURL }}">
        <input type="hidden" name="EWAY_ACCESSCODE" value="{{ accessCode }}">
        <input type="hidden" name="EWAY_CARDNAME" value="{{ cardName }}">
        <input type="hidden" name="EWAY_CARDNUMBER" value="{{ cardNumber }}">
        <input type="hidden" name="EWAY_CARDEXPIRYMONTH" value="{{ cardExpiryMonth }}">
        <input type="hidden" name="EWAY_CARDEXPIRYYEAR" value="{{ cardExpiryYear }}">
        <input type="hidden" name="EWAY_CARDCVN" value="{{ cardCVN }}">
    </form>
</script>
