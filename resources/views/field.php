<div class="gfpcl-initial" id="gfpcl-initial-<?= $field_id; ?>">
    <div class="field">
        <input type="text" value="<?= $value; ?>" class="lookup-field <?= $class; ?>" <?= $attributes['placeholder']; ?> autocomplete="off">

        <div class="lookup-results">
            <ul class="result-list"></ul>
        </div>
    </div>

    <a href="#" class="gfpcl-lookup" id="gfpcl-trigger-lookup-<?= $field_id; ?>" data-postcode-input=".lookup-field" onclick="return false;"><?= $button_text; ?></a>
</div>

<div class="gfpcl-form-toggle">
    <a href="#" id="toggle-form-state-<?= $field_id; ?>" data-default="Enter your address manually" data-manual="Find your address by postcode">Enter your address manually</a>
</div>

<div class="gfpcl-address-fields ginput_complex ginput_container" id="<?= $field_id; ?>">
    <div class="address-field address-1">
        <label for="<?= $field_id; ?>_1">Address Line 1</label>
        <input type="text" id="<?= $field_id; ?>_1" type="text" name="input_<?= $id; ?>_1" <?= $attributes['required']; ?> data-line="address_1">
    </div>

    <div class="address-field address-2">
        <label for="<?= $field_id; ?>_2">Address Line 2</label>
        <input type="text" id="<?= $field_id; ?>_2" type="text" name="input_<?= $id; ?>_2" data-line="address_2">
    </div>

    <div class="address-field address-city">
        <label for="<?= $field_id; ?>_city">City</label>
        <input type="text" id="<?= $field_id; ?>_city" type="text" name="input_<?= $id; ?>_city" data-line="city">
    </div>

    <div class="address-field address-county">
        <label for="<?= $field_id; ?>_county">County</label>
        <input type="text" id="<?= $field_id; ?>_county" type="text" name="input_<?= $id; ?>_county" data-county="county">
    </div>

    <div class="address-field address-postcode">
        <label for="<?= $field_id; ?>_postcode">Postcode</label>
        <input type="text" id="<?= $field_id; ?>_postcode" type="text" name="input_<?= $id; ?>_postcode" <?= $attributes['required']; ?> data-postcode="postcode">
    </div>
</div>

<input name="input_<?= $id; ?>" id="<?= $field_id; ?>" type="hidden" value="<?= $value; ?>" class="<?= $class; ?> gfpcl-fillable" <?= $attributes['required']; ?>>